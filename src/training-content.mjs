import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CONTENT_DIRECTORY = join(dirname(fileURLToPath(import.meta.url)), "..", "training-content", "frameworks");
const MAX_FILE_BYTES = 64 * 1024;
const MANIFEST_KEYS = ["id", "displayName", "startMode", "feedbackModes", "finalFeedbackMode", "characterPromptFile", "evaluatorPromptFile", "immediateFeedbackPromptFile", "scenariosFile"];
const MODES = new Set(["final", "immediate-and-final"]);
const START_MODES = new Set(["character-opens", "user-opens-with-context"]);
export class TrainingContentError extends Error {}
const fail = () => { throw new TrainingContentError("invalid_training_content"); };
const isText = (value) => typeof value === "string" && value.trim().length > 0;
const isId = (value) => typeof value === "string" && /^[a-z][a-z0-9-]{0,63}$/.test(value);
const isFile = (value) => typeof value === "string" && /^(?:prompts|characters)\/[a-z][a-z0-9-]*\.md$/.test(value);
const isScenarioFile = (value) => value === "scenarios.json";
function exact(value, keys) { return value !== null && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key)); }
async function text(reader, path) { let bytes; try { bytes = await reader(path); } catch { fail(); } if (!Buffer.isBuffer(bytes) || bytes.length > MAX_FILE_BYTES) fail(); try { const result = new TextDecoder("utf-8", { fatal: true }).decode(bytes); if (!isText(result)) fail(); return result; } catch (error) { if (error instanceof TrainingContentError) throw error; fail(); } }
function json(value) { try { return JSON.parse(value); } catch { fail(); } }
function frozen(value) { return Object.freeze(value); }
function manifest(value) {
  if (!exact(value, MANIFEST_KEYS) || !isId(value.id) || !isText(value.displayName) || !START_MODES.has(value.startMode) || !Array.isArray(value.feedbackModes) || value.feedbackModes.length < 1 || value.feedbackModes.some((mode) => !MODES.has(mode)) || new Set(value.feedbackModes).size !== value.feedbackModes.length || !["EVALUATE", "FINAL_EVALUATE"].includes(value.finalFeedbackMode) || !isFile(value.characterPromptFile) || !isFile(value.evaluatorPromptFile) || !isFile(value.immediateFeedbackPromptFile) || !isScenarioFile(value.scenariosFile)) fail();
  return value;
}
async function loadFramework(name, reader) {
  if (!isId(name)) fail();
  const directory = join(CONTENT_DIRECTORY, name);
  const value = manifest(json(await text(reader, join(directory, "manifest.json"))));
  if (value.id !== name) fail();
  const [characterPrompt, evaluatorPrompt, immediateFeedbackPrompt, scenarioText] = await Promise.all([text(reader, join(directory, value.characterPromptFile)), text(reader, join(directory, value.evaluatorPromptFile)), text(reader, join(directory, value.immediateFeedbackPromptFile)), text(reader, join(directory, value.scenariosFile))]);
  const rawScenarios = json(scenarioText);
  if (!Array.isArray(rawScenarios) || rawScenarios.length < 1 || rawScenarios.length > 20) fail();
  const ids = new Set();
  const scenarios = [];
  for (const raw of rawScenarios) {
    const keys = Object.hasOwn(raw ?? {}, "characterProfileFile") ? ["id", "displayName", "publicContext", "privateContext", "characterProfileFile"] : ["id", "displayName", "publicContext", "privateContext"];
    if (!exact(raw, keys) || !isId(raw.id) || ids.has(raw.id) || !isText(raw.displayName) || !isText(raw.publicContext) || !isText(raw.privateContext)) fail();
    ids.add(raw.id);
    const characterProfile = raw.characterProfileFile === undefined ? "" : await text(reader, join(directory, isFile(raw.characterProfileFile) ? raw.characterProfileFile : fail()));
    scenarios.push(frozen({ id: raw.id, displayName: raw.displayName, publicContext: raw.publicContext, privateContext: raw.privateContext, characterProfile }));
  }
  const hash = createHash("sha256").update(JSON.stringify(value)).update(characterPrompt).update(evaluatorPrompt).update(immediateFeedbackPrompt).update(JSON.stringify(scenarios)).digest("hex");
  return frozen({ id: value.id, displayName: value.displayName, startMode: value.startMode, feedbackModes: frozen([...value.feedbackModes]), finalFeedbackMode: value.finalFeedbackMode, characterPrompt, evaluatorPrompt, immediateFeedbackPrompt, scenarios: frozen(scenarios), version: hash });
}
export async function loadTrainingContent({ fileReader = readFile, directoryReader = readdir } = {}) {
  let names; try { names = await directoryReader(CONTENT_DIRECTORY); } catch { fail(); }
  if (!Array.isArray(names)) fail();
  const frameworks = [];
  for (const name of names.sort()) { try { frameworks.push(await loadFramework(name, fileReader)); } catch { /* Invalid packages are deliberately not published. */ } }
  if (frameworks.length === 0) fail();
  const byId = frozen(Object.fromEntries(frameworks.map((framework) => [framework.id, framework])));
  return frozen({ frameworks: frozen(frameworks), byId });
}
export function publicCatalog(content) { return frozen({ frameworks: content.frameworks.map((framework) => frozen({ id: framework.id, displayName: framework.displayName, feedbackModes: framework.feedbackModes, scenarios: frozen(framework.scenarios.map(({ id, displayName, publicContext }) => frozen({ id, displayName, publicContext }))) })) }); }
