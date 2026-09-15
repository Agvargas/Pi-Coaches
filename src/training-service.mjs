import { randomUUID } from "node:crypto";
import { loadTrainingContent, publicCatalog } from "./training-content.mjs";
import { createSdkSessionFactory } from "./sdk-session-factory.mjs";
const MAX_MESSAGES = 20, MAX_ACTIVE_TRAININGS = 3, MAX_TRANSCRIPT_CHARACTERS = 100_000, PROMPT_TIMEOUT_MS = 90_000;
export const BLOCK_MESSAGE = "That message does not address the current practice. Please respond to the character's situation.";
export class PromptTimeoutError extends Error {} export class TrainingLimitError extends Error {} export class TrainingShuttingDownError extends Error {} export class TrainingNotFoundError extends Error {} export class TrainingBusyError extends Error {}
function reply(session) { const value = session.getLastAssistantText(); if (typeof value !== "string" || value.length === 0) throw new Error("empty_reply"); return value; }
function transcript(transcriptValue) { return transcriptValue.map(({ speaker, text }) => `[${speaker}]\n${text}\n[END ${speaker}]`).join("\n"); }
function lengthOf(value) { return value.reduce((total, turn) => total + turn.speaker.length + turn.text.length, 0); }
async function prompt(session, value, observation) {
  let timer, unsubscribe, retries = 0, completions = 0, outcome = "success", decision = null, failureKind = null;
  const usageTotals = { input:0, output:0, cacheRead:0, cacheWrite:0, costTotal:0 }, usageValid = { input:true, output:true, cacheRead:true, cacheWrite:true, costTotal:true };
  const recorder = typeof observation?.recorder === "function" ? observation.recorder : undefined;
  const started = performance.now();
  try {
    if (recorder && typeof session.subscribe === "function") {
      const listener = (event) => { try {
        if (event?.type === "auto_retry_start") retries++;
        if (event?.type === "message_end" && event?.message?.role === "assistant") {
          completions++; const u = event.message.usage, values = { input:u?.input, output:u?.output, cacheRead:u?.cacheRead, cacheWrite:u?.cacheWrite, costTotal:u?.cost?.total };
          for (const [key,n] of Object.entries(values)) { if (typeof n === "number" && Number.isFinite(n) && n >= 0) usageTotals[key]+=n; else usageValid[key]=false; }
          if (event.message.stopReason === "error") { const text=typeof event.message.errorMessage === "string" ? event.message.errorMessage.toLowerCase() : ""; failureKind=/(auth|unauthori[sz]ed|401|api key|oauth|credential)/.test(text)?"auth":"provider"; }
        }
      } catch {} };
      try { unsubscribe = session.subscribe(listener); } catch {}
    }
    await Promise.race([session.prompt(value), new Promise((_, reject) => { timer = setTimeout(() => reject(new PromptTimeoutError()), PROMPT_TIMEOUT_MS); })]);
    const text = reply(session);
    if (observation?.stage === "VALIDATE") decision = text.trim() === "BLOCK" ? "BLOCK" : "ALLOW";
    return text;
  } catch (error) {
    outcome = error instanceof PromptTimeoutError ? "timeout" : "error";
    if (error instanceof PromptTimeoutError) await session.abort().catch(() => {});
    throw error;
  } finally {
    clearTimeout(timer); if (typeof unsubscribe === "function") try { unsubscribe(); } catch {}
    if (recorder) try { recorder({ stage:observation.stage, turn:observation.turn, frameworkId:observation.frameworkId, feedbackMode:observation.feedbackMode, durationMs:performance.now()-started, outcome, completions, retries, usage:completions>0?Object.fromEntries(Object.keys(usageTotals).map((key)=>[key,usageValid[key]?usageTotals[key]:null])):null, usageComplete:completions>0&&Object.values(usageValid).every(Boolean), decision, failureKind }); } catch {}
  }
}
function dispose(training) { training.characterSession?.dispose(); training.evaluatorSession?.dispose(); }
function exercise(training) { return `${training.scenario.characterProfile ? `${training.scenario.characterProfile}\n\n` : ""}${training.scenario.privateContext}`; }
export class TrainingService {
  constructor({ contentLoader = loadTrainingContent, sessionFactoryCreator = createSdkSessionFactory, recorder = undefined } = {}) { this.recorder = typeof recorder === "function" ? recorder : undefined; this.trainings = new Map(); this.pendingCreations = new Set(); this.pendingTrainings = 0; this.shuttingDown = false; this.initializationError = false; this.initialization = this.initialize(contentLoader, sessionFactoryCreator); }
  async initialize(loader, creator) { try { this.content = await loader(); this.sessionFactory = await creator(); } catch { this.initializationError = true; } }
  async ensureReady() { await this.initialization; if (this.initializationError || !this.content || !this.sessionFactory) throw new Error("service_unavailable"); }
  async getCatalog() { await this.ensureReady(); return publicCatalog(this.content); }
  observe(stage, turn, frameworkId, feedbackMode) { return this.recorder ? { recorder:this.recorder, stage, turn, frameworkId, feedbackMode } : undefined; }
  async createTraining({ frameworkId, scenarioId, feedbackMode }) {
    if (this.shuttingDown) throw new TrainingShuttingDownError(); if (this.trainings.size + this.pendingTrainings >= MAX_ACTIVE_TRAININGS) throw new TrainingLimitError(); this.pendingTrainings++; const pending = {}; this.pendingCreations.add(pending);
    try { await this.ensureReady(); const framework = this.content.byId[frameworkId]; const scenario = framework?.scenarios.find((item) => item.id === scenarioId); if (!scenario || !framework.feedbackModes.includes(feedbackMode)) throw new TrainingNotFoundError();
      pending.characterSession = await this.sessionFactory.createSession({ systemPrompt: `${framework.characterPrompt}\n\nAssigned situation (trusted exercise data):\n${exercise({ scenario })}`, thinkingLevel: "low" });
      if (this.shuttingDown) throw new TrainingShuttingDownError(); pending.evaluatorSession = await this.sessionFactory.createSession({ systemPrompt: framework.evaluatorPrompt, thinkingLevel: "medium" }); if (this.shuttingDown) throw new TrainingShuttingDownError();
      let openingMessage; const turns = []; if (framework.startMode === "character-opens") { openingMessage = await prompt(pending.characterSession, "Begin the role-play by presenting your concern to the user.", this.observe("CHARACTER", 0, framework.id, feedbackMode)); if (this.shuttingDown) throw new TrainingShuttingDownError(); turns.push({ speaker: "Character", text: openingMessage }); }
      if (this.shuttingDown) throw new TrainingShuttingDownError(); const trainingId = randomUUID(); this.trainings.set(trainingId, { ...pending, framework, scenario, feedbackMode, transcript: turns, messageCount: 0, lock: false, ending: false });
      return framework.startMode === "character-opens" ? { trainingId, startMode: framework.startMode, openingMessage } : { trainingId, startMode: framework.startMode, publicContext: scenario.publicContext };
    } catch (error) { dispose(pending); throw error; } finally { this.pendingCreations.delete(pending); this.pendingTrainings--; }
  }
  available(id, ending = false) { const training = this.trainings.get(id); if (!training) throw new TrainingNotFoundError(); if (training.lock || training.ending) throw new TrainingBusyError(); training.lock = true; if (ending) training.ending = true; return training; }
  retire(training) { for (const [id, value] of this.trainings) if (value === training) this.trainings.delete(id); dispose(training); }
  cancelTraining(id) { const training = this.available(id); this.retire(training); }
  async sendMessage(id, message) { const training = this.available(id); const progress = { calledSdk: false }; try { return await this.handleMessage(training, message, progress); } catch (error) { if (progress.calledSdk) this.retire(training); throw error; } finally { training.lock = false; } }
  async handleMessage(training, message, progress) {
    if (training.messageCount >= MAX_MESSAGES || lengthOf(training.transcript) + message.length > MAX_TRANSCRIPT_CHARACTERS) throw new TrainingLimitError(); training.messageCount++;
    const base = `Assigned situation (trusted exercise data):\n${exercise(training)}\n[TRANSCRIPT]\n${transcript(training.transcript)}\n[END TRANSCRIPT]`;
    progress.calledSdk = true; const validationReply = await prompt(training.evaluatorSession, `${training.framework.evaluatorPrompt}\n\nMODE: VALIDATE\n${base}\n[USER MESSAGE]\n${message}\n[END USER MESSAGE]`, this.observe("VALIDATE", training.messageCount, training.framework.id, training.feedbackMode));
    if (validationReply.trim() === "BLOCK") return { status: "blocked", message: BLOCK_MESSAGE };
    training.transcript.push({ speaker: "User", text: message }); const characterReply = await prompt(training.characterSession, message, this.observe("CHARACTER", training.messageCount, training.framework.id, training.feedbackMode)); if (lengthOf(training.transcript) + characterReply.length > MAX_TRANSCRIPT_CHARACTERS) throw new TrainingLimitError(); training.transcript.push({ speaker: "Character", text: characterReply });
    const result = { status: "accepted", reply: characterReply };
    if (training.feedbackMode === "immediate-and-final") { result.feedback = await prompt(training.evaluatorSession, `${training.framework.immediateFeedbackPrompt}\n\nMODE: IMMEDIATE_FEEDBACK\nAssigned situation (trusted exercise data):\n${exercise(training)}\n[TRANSCRIPT]\n${transcript(training.transcript)}\n[END TRANSCRIPT]`, this.observe("IMMEDIATE_FEEDBACK", training.messageCount, training.framework.id, training.feedbackMode)); }
    return result;
  }
  async endTraining(id) { const training = this.available(id, true); try { const feedback = await prompt(training.evaluatorSession, `${training.framework.evaluatorPrompt}\n\nMODE: ${training.framework.finalFeedbackMode}\nAssigned situation (trusted exercise data):\n${exercise(training)}\n[TRANSCRIPT]\n${transcript(training.transcript)}\n[END TRANSCRIPT]`, this.observe("FINAL_FEEDBACK", training.messageCount, training.framework.id, training.feedbackMode)); return { feedback }; } finally { training.lock = false; this.retire(training); } }
  async shutdown() { if (this.shuttingDown) return; this.shuttingDown = true; for (const item of [...this.trainings.values(), ...this.pendingCreations]) { await item.characterSession?.abort().catch(() => {}); await item.evaluatorSession?.abort().catch(() => {}); dispose(item); } this.trainings.clear(); }
}
