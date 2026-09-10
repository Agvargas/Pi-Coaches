import {
  createAgentSession,
  DefaultResourceLoader,
  ModelRuntime,
  SessionManager,
  SettingsManager,
} from "@earendil-works/pi-coding-agent";

const MODEL_PROVIDER = "openai-codex";
const MODEL_ID = "gpt-5.6-terra";

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
  const model = availableModels.find((candidate) => candidate.provider === MODEL_PROVIDER && candidate.id === MODEL_ID);
  if (!model) throw new Error("model_unavailable");
  return Object.freeze({
    async createSession({ systemPrompt, thinkingLevel }) {
      const settingsManager = SettingsManager.inMemory({ compaction: { enabled: false } });
      const resourceLoader = createResourceLoader(systemPrompt, settingsManager);
      await resourceLoader.reload();
      const { session } = await createAgentSession({
        cwd: process.cwd(),
        model,
        thinkingLevel,
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
