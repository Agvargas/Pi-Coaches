import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CONTENT_DIRECTORY = join(dirname(fileURLToPath(import.meta.url)), "..", "training-content", "heart");
const SCENARIO_IDS = ["air-conditioning", "sofa-bed", "missed-breakfast"];
const MAX_PROMPT_BYTES = 32 * 1024;
const MAX_SCENARIOS_BYTES = 64 * 1024;

export class TrainingContentError extends Error {}

function failValidation() {
  throw new TrainingContentError("invalid_training_content");
}

async function readUtf8(fileReader, path, maximumBytes) {
  let bytes;
  try {
    bytes = await fileReader(path);
  } catch {
    failValidation();
  }
  if (!Buffer.isBuffer(bytes) || bytes.length > maximumBytes) failValidation();
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    failValidation();
  }
}

function validateText(value) {
  if (typeof value !== "string" || value.trim().length === 0) failValidation();
  return value;
}

function validateScenarios(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)
    || Object.getPrototypeOf(value) !== Object.prototype) failValidation();
  const keys = Object.keys(value);
  if (keys.length !== SCENARIO_IDS.length || !SCENARIO_IDS.every((id) => Object.hasOwn(value, id))) failValidation();
  return Object.freeze(Object.fromEntries(SCENARIO_IDS.map((id) => [id, validateText(value[id])] )));
}

function createVersion(guestPrompt, evaluatorPrompt, scenarios) {
  const hash = createHash("sha256");
  hash.update("guest\0").update(guestPrompt).update("\0evaluator\0").update(evaluatorPrompt);
  for (const id of SCENARIO_IDS) hash.update(`\0${id}\0`).update(scenarios[id]);
  return hash.digest("hex");
}

export async function loadTrainingContent({ fileReader = readFile } = {}) {
  const guestPromptPath = join(CONTENT_DIRECTORY, "guest-prompt.md");
  const evaluatorPromptPath = join(CONTENT_DIRECTORY, "evaluator-prompt.md");
  const scenariosPath = join(CONTENT_DIRECTORY, "scenarios.json");
  const [guestPrompt, evaluatorPrompt, scenariosText] = await Promise.all([
    readUtf8(fileReader, guestPromptPath, MAX_PROMPT_BYTES),
    readUtf8(fileReader, evaluatorPromptPath, MAX_PROMPT_BYTES),
    readUtf8(fileReader, scenariosPath, MAX_SCENARIOS_BYTES),
  ]);
  let parsedScenarios;
  try {
    parsedScenarios = JSON.parse(scenariosText);
  } catch {
    failValidation();
  }
  const scenarios = validateScenarios(parsedScenarios);
  return Object.freeze({
    guestPrompt: validateText(guestPrompt),
    evaluatorPrompt: validateText(evaluatorPrompt),
    scenarios,
    version: createVersion(guestPrompt, evaluatorPrompt, scenarios),
  });
}
