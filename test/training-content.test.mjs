import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { TrainingContentError, loadTrainingContent } from "../src/training-content.mjs";

const manifest = JSON.stringify({ guestPromptFile: "guest-prompt.md", evaluatorPromptFile: "evaluator-prompt.md", scenariosFile: "scenarios.json" });
const scenarios = JSON.stringify({ "air-conditioning": "Air", "sofa-bed": "Sofa", "missed-breakfast": "Breakfast" });
function reader(values = {}) { return async (path) => Buffer.from(values[path.split(/[\\/]/).pop()] ?? ({ "manifest.json": manifest, "guest-prompt.md": "Guest", "evaluator-prompt.md": "Evaluator", "scenarios.json": scenarios })[path.split(/[\\/]/).pop()]); }
async function rejects(values) { await assert.rejects(() => loadTrainingContent({ fileReader: reader(values) }), TrainingContentError); }

test("loads immutable migrated content with approved hashes", async () => {
  const content = await loadTrainingContent();
  const hash = (value) => createHash("sha256").update(value).digest("hex");
  assert.equal(Object.isFrozen(content), true); assert.equal(Object.isFrozen(content.scenarios), true);
  assert.deepEqual(Object.keys(content.scenarios), ["air-conditioning", "sofa-bed", "missed-breakfast"]);
  assert.equal(hash(content.guestPrompt), "2813c2951d9bd75ea0b788c94c9a151a4819e27159705aa090f69e9763dbcfdb");
  assert.equal(hash(content.evaluatorPrompt), "8d3b42b0f4a01e5aadba0e079204cd1ef7760faf887231259d56517933a62413");
  assert.equal(hash(content.scenarios["air-conditioning"]), "738f5bac72d8fee09836e5a76b62b37de8079a2a506da4d1664e51342ecfa9d7");
  assert.equal(hash(content.scenarios["sofa-bed"]), "b212828479092b7e51846b62701fa056459e43299d59211e0e874aff49cff856");
  assert.equal(hash(content.scenarios["missed-breakfast"]), "7c15c2a2d03c01ce49d531e9894af11e4c6e9768242c5025d699012fb2bfaadd");
});
test("rejects invalid manifest, JSON, schema, empty values, and size", async () => {
  await rejects({ "manifest.json": "{" }); await rejects({ "manifest.json": JSON.stringify({ guestPromptFile: "../x", evaluatorPromptFile: "evaluator-prompt.md", scenariosFile: "scenarios.json" }) });
  await rejects({ "scenarios.json": "{" }); await rejects({ "scenarios.json": JSON.stringify({ "air-conditioning": "a", "sofa-bed": "b" }) });
  await rejects({ "guest-prompt.md": " " }); await rejects({ "guest-prompt.md": "a".repeat(32 * 1024 + 1) }); await rejects({ "scenarios.json": " ".repeat(64 * 1024 + 1) });
});
test("rejects invalid UTF-8 and read failures", async () => {
  await rejects({ "guest-prompt.md": Buffer.from([0xc3, 0x28]) });
  await assert.rejects(() => loadTrainingContent({ fileReader: async () => { throw new Error(); } }), TrainingContentError);
});
