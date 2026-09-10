import assert from "node:assert/strict";
import test from "node:test";
import { TrainingBusyError, TrainingService } from "../src/training-service.mjs";

const content = Object.freeze({ guestPrompt: "Guest prompt", evaluatorPrompt: "Evaluator prompt", scenarios: Object.freeze({ "air-conditioning": "Air scenario", "sofa-bed": "Sofa scenario", "missed-breakfast": "Breakfast scenario" }), version: "version" });
function fakeSession(reply) { return { prompts: [], disposed: false, async prompt(text) { this.prompts.push(text); }, getLastAssistantText() { return reply; }, async abort() {}, dispose() { this.disposed = true; } }; }
function setup({ evaluatorReply = "ALLOW" } = {}) {
  const calls = []; const sessions = [];
  const factoryCreator = async () => ({ async createSession(options) { calls.push(options); const session = fakeSession(calls.length % 2 ? "Guest opening" : evaluatorReply); sessions.push(session); return session; } });
  return { service: new TrainingService({ contentLoader: async () => content, sessionFactoryCreator: factoryCreator }), calls, sessions };
}

test("initializes once and creates isolated Guest/Evaluator sessions with approved options", async () => {
  const { service, calls, sessions } = setup();
  const training = await service.createTraining("air-conditioning");
  assert.ok(training.trainingId); assert.equal(calls.length, 2); assert.notEqual(sessions[0], sessions[1]);
  assert.equal(calls[0].thinkingLevel, "low"); assert.equal(calls[1].thinkingLevel, "medium");
  assert.match(calls[0].systemPrompt, /Guest prompt[\s\S]*Air scenario/); assert.equal(calls[1].systemPrompt, "Evaluator prompt");
});
test("owns locks, validates with transcript, and cleans both sessions on end", async () => {
  const { service, sessions } = setup(); const { trainingId } = await service.createTraining("air-conditioning");
  const training = service.trainings.get(trainingId); training.lock = true;
  await assert.rejects(() => service.sendMessage(trainingId, "Hello"), TrainingBusyError); training.lock = false;
  const result = await service.sendMessage(trainingId, "I will help with the noise."); assert.equal(result.status, "accepted");
  assert.match(sessions[1].prompts[0], /MODE: VALIDATE[\s\S]*\[TRANSCRIPT\]/);
  await service.endTraining(trainingId); assert.equal(service.trainings.has(trainingId), false); assert.equal(sessions[0].disposed, true); assert.equal(sessions[1].disposed, true);
});
test("cleans partial session creation failures", async () => {
  const firstGuest = fakeSession("Guest opening"); let guest = firstGuest;
  const service = new TrainingService({ contentLoader: async () => content, sessionFactoryCreator: async () => ({ async createSession() { if (guest) { const value = guest; guest = null; return value; } throw new Error("factory_failed"); } }) });
  await assert.rejects(() => service.createTraining("air-conditioning")); assert.equal(firstGuest.disposed, true);
});
