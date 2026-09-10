import { randomUUID } from "node:crypto";
import { loadTrainingContent } from "./training-content.mjs";
import { createSdkSessionFactory } from "./sdk-session-factory.mjs";

const MAX_MESSAGE_CHARACTERS = 4_000;
const MAX_MESSAGES = 20;
const MAX_ACTIVE_TRAININGS = 3;
const MAX_TRANSCRIPT_CHARACTERS = 100_000;
const PROMPT_TIMEOUT_MS = 90_000;
export const BLOCK_MESSAGE = "That message does not address the current guest situation. Please respond as a hotel Team Member to the guest's concern.";

export class PromptTimeoutError extends Error {}
export class TrainingLimitError extends Error {}
export class TrainingShuttingDownError extends Error {}
export class TrainingNotFoundError extends Error {}
export class TrainingBusyError extends Error {}

function getReply(session) {
  const reply = session.getLastAssistantText();
  if (typeof reply !== "string" || reply.length === 0) throw new Error("empty_reply");
  return reply;
}

function formatTranscript(transcript) {
  return transcript.map(({ speaker, text }) => `[${speaker}]\n${text}\n[END ${speaker}]`).join("\n");
}

function transcriptLength(transcript) {
  return transcript.reduce((length, turn) => length + turn.speaker.length + turn.text.length, 0);
}

async function promptWithTimeout(session, prompt) {
  let timer;
  try {
    await Promise.race([
      session.prompt(prompt),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new PromptTimeoutError()), PROMPT_TIMEOUT_MS); }),
    ]);
  } catch (error) {
    if (error instanceof PromptTimeoutError) await session.abort().catch(() => {});
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function disposeTraining(training) {
  training.guestSession?.dispose();
  training.evaluatorSession?.dispose();
}

export class TrainingService {
  constructor({ contentLoader = loadTrainingContent, sessionFactoryCreator = createSdkSessionFactory } = {}) {
    this.trainings = new Map();
    this.pendingCreations = new Set();
    this.pendingTrainings = 0;
    this.shuttingDown = false;
    this.initializationError = false;
    this.initialization = this.initialize(contentLoader, sessionFactoryCreator);
  }

  async initialize(contentLoader, sessionFactoryCreator) {
    try {
      const content = await contentLoader();
      const sessionFactory = await sessionFactoryCreator();
      this.content = content;
      this.sessionFactory = sessionFactory;
    } catch {
      this.initializationError = true;
    }
  }

  async ensureReady() {
    await this.initialization;
    if (this.initializationError || !this.content || !this.sessionFactory) throw new Error("service_unavailable");
  }

  async createTraining(scenarioId) {
    if (this.shuttingDown) throw new TrainingShuttingDownError();
    if (this.trainings.size + this.pendingTrainings >= MAX_ACTIVE_TRAININGS) throw new TrainingLimitError();
    this.pendingTrainings += 1;
    const pendingCreation = { guestSession: undefined, evaluatorSession: undefined };
    this.pendingCreations.add(pendingCreation);
    try {
      await this.ensureReady();
      const content = this.content;
      const scenario = content.scenarios[scenarioId];
      pendingCreation.guestSession = await this.sessionFactory.createSession({ systemPrompt: `${content.guestPrompt}\n\nAssigned situation (trusted exercise data):\n${scenario}`, thinkingLevel: "low" });
      if (this.shuttingDown) throw new TrainingShuttingDownError();
      pendingCreation.evaluatorSession = await this.sessionFactory.createSession({ systemPrompt: content.evaluatorPrompt, thinkingLevel: "medium" });
      if (this.shuttingDown) throw new TrainingShuttingDownError();
      await promptWithTimeout(pendingCreation.guestSession, "Begin the role-play by presenting your concern to the Team Member.");
      const openingMessage = getReply(pendingCreation.guestSession);
      if (this.shuttingDown) throw new TrainingShuttingDownError();
      const trainingId = randomUUID();
      this.trainings.set(trainingId, { guestSession: pendingCreation.guestSession, evaluatorSession: pendingCreation.evaluatorSession, scenarioId, scenario, evaluatorPrompt: content.evaluatorPrompt, contentVersion: content.version, transcript: [{ speaker: "Guest", text: openingMessage }], messageCount: 0, lock: false, ending: false });
      return { trainingId, openingMessage };
    } catch (error) {
      disposeTraining(pendingCreation);
      throw error;
    } finally {
      this.pendingCreations.delete(pendingCreation);
      this.pendingTrainings -= 1;
    }
  }

  getAvailableTraining(trainingId, ending = false) {
    const training = this.trainings.get(trainingId);
    if (!training) throw new TrainingNotFoundError();
    if (training.lock || training.ending) throw new TrainingBusyError();
    training.lock = true;
    if (ending) training.ending = true;
    return training;
  }

  async sendMessage(trainingId, message) {
    const training = this.getAvailableTraining(trainingId);
    try { return await this.handleMessage(training, message); } finally { training.lock = false; }
  }

  async handleMessage(training, message) {
    if (training.messageCount >= MAX_MESSAGES || transcriptLength(training.transcript) + message.length > MAX_TRANSCRIPT_CHARACTERS) throw new TrainingLimitError();
    training.messageCount += 1;
    const validationPrompt = `${training.evaluatorPrompt}\n\nMODE: VALIDATE\nAssigned situation (trusted exercise data):\n${training.scenario}\n[TRANSCRIPT]\n${formatTranscript(training.transcript)}\n[END TRANSCRIPT]\n[TEAM MEMBER MESSAGE]\n${message}\n[END TEAM MEMBER MESSAGE]`;
    await promptWithTimeout(training.evaluatorSession, validationPrompt);
    if (getReply(training.evaluatorSession).trim() === "BLOCK") return { status: "blocked", message: BLOCK_MESSAGE };
    training.transcript.push({ speaker: "Team Member", text: message });
    await promptWithTimeout(training.guestSession, message);
    const reply = getReply(training.guestSession);
    if (transcriptLength(training.transcript) + reply.length > MAX_TRANSCRIPT_CHARACTERS) throw new TrainingLimitError();
    training.transcript.push({ speaker: "Guest", text: reply });
    return { status: "accepted", reply };
  }

  async endTraining(trainingId) {
    const training = this.getAvailableTraining(trainingId, true);
    const evaluationPrompt = `${training.evaluatorPrompt}\n\nMODE: EVALUATE\nAssigned situation (trusted exercise data):\n${training.scenario}\n[TRANSCRIPT]\n${formatTranscript(training.transcript)}\n[END TRANSCRIPT]`;
    try {
      await promptWithTimeout(training.evaluatorSession, evaluationPrompt);
      return { feedback: getReply(training.evaluatorSession) };
    } finally {
      training.lock = false;
      this.trainings.delete(trainingId);
      disposeTraining(training);
    }
  }

  async shutdown() {
    if (this.shuttingDown) return;
    this.shuttingDown = true;
    for (const training of [...this.trainings.values(), ...this.pendingCreations]) {
      await training.guestSession?.abort().catch(() => {});
      await training.evaluatorSession?.abort().catch(() => {});
      disposeTraining(training);
    }
    this.trainings.clear();
  }
}
