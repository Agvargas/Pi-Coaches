import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { TrainingContentError, loadTrainingContent } from "../src/training-content.mjs";

const validScenarios = JSON.stringify({
  "air-conditioning": "Air conditioning scenario",
  "sofa-bed": "Sofa bed scenario",
  "missed-breakfast": "Missed breakfast scenario",
});

function reader({ guest = "Guest prompt", evaluator = "Evaluator prompt", scenarios = validScenarios } = {}) {
  return async (path) => {
    if (path.endsWith("guest-prompt.md")) return Buffer.from(guest);
    if (path.endsWith("evaluator-prompt.md")) return Buffer.from(evaluator);
    if (path.endsWith("scenarios.json")) return Buffer.from(scenarios);
    throw new Error("unexpected_path");
  };
}

async function rejectsContent(options) {
  await assert.rejects(() => loadTrainingContent(options), TrainingContentError);
}

test("loads the versioned HEART content as an immutable snapshot with migrated hashes", async () => {
  const content = await loadTrainingContent();
  assert.deepEqual(Object.keys(content.scenarios), ["air-conditioning", "sofa-bed", "missed-breakfast"]);
  assert.equal(Object.isFrozen(content), true);
  assert.equal(Object.isFrozen(content.scenarios), true);
  const sha256 = (value) => createHash("sha256").update(value).digest("hex");
  assert.equal(sha256(content.guestPrompt), "2813c2951d9bd75ea0b788c94c9a151a4819e27159705aa090f69e9763dbcfdb");
  assert.equal(sha256(content.evaluatorPrompt), "8d3b42b0f4a01e5aadba0e079204cd1ef7760faf887231259d56517933a62413");
  assert.equal(sha256(content.scenarios["air-conditioning"]), "738f5bac72d8fee09836e5a76b62b37de8079a2a506da4d1664e51342ecfa9d7");
  assert.equal(sha256(content.scenarios["sofa-bed"]), "b212828479092b7e51846b62701fa056459e43299d59211e0e874aff49cff856");
  assert.equal(sha256(content.scenarios["missed-breakfast"]), "7c15c2a2d03c01ce49d531e9894af11e4c6e9768242c5025d699012fb2bfaadd");
});

test("rejects invalid JSON", async () => {
  await rejectsContent({ fileReader: reader({ scenarios: "{" }) });
});

test("rejects missing or extra scenario keys", async () => {
  await rejectsContent({ fileReader: reader({ scenarios: JSON.stringify({ "air-conditioning": "a", "sofa-bed": "b" }) }) });
  await rejectsContent({ fileReader: reader({ scenarios: JSON.stringify({ "air-conditioning": "a", "sofa-bed": "b", "missed-breakfast": "c", extra: "d" }) }) });
});

test("rejects empty prompts and scenario values", async () => {
  await rejectsContent({ fileReader: reader({ guest: "" }) });
  await rejectsContent({ fileReader: reader({ evaluator: "   " }) });
  await rejectsContent({ fileReader: reader({ scenarios: JSON.stringify({ "air-conditioning": "a", "sofa-bed": "", "missed-breakfast": "c" }) }) });
});

test("rejects prompts and scenarios files over their internal size limits", async () => {
  await rejectsContent({ fileReader: reader({ guest: "a".repeat(32 * 1024 + 1) }) });
  await rejectsContent({ fileReader: reader({ scenarios: " ".repeat(64 * 1024 + 1) }) });
});

test("rejects invalid UTF-8 and file read failures", async () => {
  await rejectsContent({ fileReader: reader({ guest: Buffer.from([0xc3, 0x28]) }) });
  await rejectsContent({ fileReader: async () => { throw new Error("read_failed"); } });
});
