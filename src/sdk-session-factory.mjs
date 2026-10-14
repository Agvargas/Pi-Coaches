import {
  createAgentSession,
  DefaultResourceLoader,
  ModelRuntime,
  SessionManager,
  SettingsManager,
} from "@earendil-works/pi-coding-agent";

const MODEL_PROVIDER = "openai-codex";
const ROLE_CONFIG = Object.freeze({
  character: Object.freeze({ modelId: "gpt-6-luna", thinkingLevel: "low" }),
  evaluator: Object.freeze({ modelId: "gpt-6-sol", thinkingLevel: "medium" }),
});

function roleConfiguration(role, thinkingLevel) {
  const configuration = Object.hasOwn(ROLE_CONFIG, role) ? ROLE_CONFIG[role] : undefined;
  if (!configuration || configuration.thinkingLevel !== thinkingLevel) throw new Error("invalid_session_role");
  return configuration;
}

function createResourceLoader(systemPrompt, settingsManager) {
  return new DefaultResourceLoader({
    cwd: process.cwd(),
    agentDir: process.cwd(),
    settingsManager,
    noExtensions: true,
    noSkills: true,
    noPromptTemplates: true,
    noThemes: true,
    noContextFiles: true,
    appendSystemPromptOverride: () => [],
    systemPrompt,
  });
}

export async function createSdkSessionFactory() {
  const modelRuntime = await ModelRuntime.create();
  const availableModels = await modelRuntime.getAvailable(MODEL_PROVIDER);
  const models = Object.fromEntries(Object.entries(ROLE_CONFIG).map(([role, configuration]) => [
    role,
    availableModels.find((candidate) => candidate.provider === MODEL_PROVIDER && candidate.id === configuration.modelId),
  ]));
  if (Object.values(models).some((model) => !model)) throw new Error("model_unavailable");
  return Object.freeze({
    async createSession({ role, systemPrompt, thinkingLevel }) {
      const configuration = roleConfiguration(role, thinkingLevel);
      const settingsManager = SettingsManager.inMemory({ compaction: { enabled: false } });
      const resourceLoader = createResourceLoader(systemPrompt, settingsManager);
      await resourceLoader.reload();
      const { session } = await createAgentSession({
        cwd: process.cwd(),
        model: models[role],
        thinkingLevel: configuration.thinkingLevel,
        modelRuntime,
        resourceLoader,
        sessionManager: SessionManager.inMemory(process.cwd()),
        settingsManager,
        noTools: "all",
      });
      return session;
    },
  });
}
