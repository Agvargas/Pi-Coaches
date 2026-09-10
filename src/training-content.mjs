import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CONTENT_DIRECTORY = join(dirname(fileURLToPath(import.meta.url)), "..", "training-content", "heart");
const SCENARIO_IDS = ["air-conditioning", "sofa-bed", "missed-breakfast"];
const MANIFEST_KEYS = ["guestPromptFile", "evaluatorPromptFile", "scenariosFile"];
const APPROVED_FILES = new Set(["guest-prompt.md", "evaluator-prompt.md", "scenarios.json"]);
const MAX_PROMPT_BYTES = 32 * 1024;
const MAX_SCENARIOS_BYTES = 64 * 1024;
const MAX_MANIFEST_BYTES = 4 * 1024;

export class TrainingContentError extends Error {}

function failValidation() { throw new TrainingContentError("invalid_training_content"); }

async function readUtf8(fileReader, path, maximumBytes) {
  let bytes;
  try { bytes = await fileReader(path); } catch { failValidation(); }
  if (!Buffer.isBuffer(bytes) || bytes.length > maximumBytes) failValidation();
  try { return new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch { failValidation(); }
}

function validateText(value) {
  if (typeof value !== "string" || value.trim().length === 0) failValidation();
  return value;
}

function validateExactObject(value, keys) {
  if (value === null || typeof value !== "object" || Array.isArray(value)
    || Object.getPrototypeOf(value) !== Object.prototype || Object.keys(value).length !== keys.length
    || !keys.every((key) => Object.hasOwn(value, key))) failValidation();
}

function validateManifest(value) {
  validateExactObject(value, MANIFEST_KEYS);
  for (const key of MANIFEST_KEYS) {
    const file = value[key];
    if (typeof file !== "string" || !APPROVED_FILES.has(file)
      || file.includes("..") || file.includes("/") || file.includes("\\")) failValidation();
  }
  if (value.guestPromptFile !== "guest-prompt.md" || value.evaluatorPromptFile !== "evaluator-prompt.md"
    || value.scenariosFile !== "scenarios.json") failValidation();
  return value;
}

function validateScenarios(value) {
  validateExactObject(value, SCENARIO_IDS);
  return Object.freeze(Object.fromEntries(SCENARIO_IDS.map((id) => [id, validateText(value[id])] )));
}

function parseJson(text) {
  try { return JSON.parse(text); } catch { failValidation(); }
}

function createVersion(guestPrompt, evaluatorPrompt, scenarios) {
  const hash = createHash("sha256");
  hash.update("guest\0").update(guestPrompt).update("\0evaluator\0").update(evaluatorPrompt);
  for (const id of SCENARIO_IDS) hash.update(`\0${id}\0`).update(scenarios[id]);
  return hash.digest("hex");
}

export async function loadTrainingContent({ fileReader = readFile } = {}) {
  const manifest = validateManifest(parseJson(await readUtf8(fileReader, join(CONTENT_DIRECTORY, "manifest.json"), MAX_MANIFEST_BYTES)));
  const [guestPrompt, evaluatorPrompt, scenariosText] = await Promise.all([
    readUtf8(fileReader, join(CONTENT_DIRECTORY, manifest.guestPromptFile), MAX_PROMPT_BYTES),
    readUtf8(fileReader, join(CONTENT_DIRECTORY, manifest.evaluatorPromptFile), MAX_PROMPT_BYTES),
    readUtf8(fileReader, join(CONTENT_DIRECTORY, manifest.scenariosFile), MAX_SCENARIOS_BYTES),
  ]);
  const scenarios = validateScenarios(parseJson(scenariosText));
  return Object.freeze({ guestPrompt: validateText(guestPrompt), evaluatorPrompt: validateText(evaluatorPrompt), scenarios, version: createVersion(guestPrompt, evaluatorPrompt, scenarios) });
}
