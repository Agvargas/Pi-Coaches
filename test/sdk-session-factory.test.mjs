import assert from "node:assert/strict";
import { test } from "node:test";
import { ModelRuntime } from "@earendil-works/pi-coding-agent";
import { createSdkSessionFactory } from "../src/sdk-session-factory.mjs";

const MODEL_PROVIDER = "openai-codex";
const roleModels = [
  { provider: MODEL_PROVIDER, id: "gpt-6-luna" },
  { provider: MODEL_PROVIDER, id: "gpt-6-sol" },
];

test("preflights both role models once and rejects unexpected role or thinking level", async (t) => {
  const providers = [];
  t.mock.method(ModelRuntime, "create", async () => ({
    async getAvailable(provider) {
      providers.push(provider);
      return roleModels;
    },
  }));

  const factory = await createSdkSessionFactory();
  assert.deepEqual(providers, [MODEL_PROVIDER]);
  await assert.rejects(
    () => factory.createSession({ role: "unknown", systemPrompt: "unused", thinkingLevel: "low" }),
    (error) => error.message === "invalid_session_role",
  );
  await assert.rejects(
    () => factory.createSession({ role: "character", systemPrompt: "unused", thinkingLevel: "medium" }),
    (error) => error.message === "invalid_session_role",
  );
  assert.deepEqual(providers, [MODEL_PROVIDER]);
});

test("preflight fails closed when either required role model is unavailable", async (t) => {
  t.mock.method(ModelRuntime, "create", async () => ({
    async getAvailable(provider) {
      assert.equal(provider, MODEL_PROVIDER);
      return [roleModels[0]];
    },
  }));

  await assert.rejects(createSdkSessionFactory(), (error) => error.message === "model_unavailable");
});
