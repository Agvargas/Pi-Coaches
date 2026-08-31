import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import {
  createAgentSession,
  DefaultResourceLoader,
  ModelRuntime,
  SessionManager,
  SettingsManager,
} from "@earendil-works/pi-coding-agent";

const HOST = "127.0.0.1";
const PORT = 3000;
const MODEL_PROVIDER = "openai-codex";
const MODEL_ID = "gpt-5.6-terra";
const THINKING_LEVEL = "low";
const COACH_PROMPT = "Eres un coach de apoyo general. Ayuda a la persona a aclarar objetivos y próximos pasos mediante preguntas breves. Sé respetuoso, práctico y honesto sobre tus límites. No ejecutes acciones externas ni solicites o reveles credenciales.";
const MAX_BODY_BYTES = 16 * 1024;

const sessions = new Map();
let service;
let initializationError;

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) {
      throw new Error("invalid_body");
    }
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new Error("invalid_body");
  }
}

function isEmptyObject(value) {
  return value !== null
    && typeof value === "object"
    && !Array.isArray(value)
    && Object.keys(value).length === 0;
}

async function initializeService() {
  const modelRuntime = await ModelRuntime.create();
  const availableModels = await modelRuntime.getAvailable(MODEL_PROVIDER);
  const model = availableModels.find(
    (candidate) => candidate.provider === MODEL_PROVIDER && candidate.id === MODEL_ID,
  );

  if (!model) {
    throw new Error("model_unavailable");
  }

  const settingsManager = SettingsManager.inMemory();
  const resourceLoader = new DefaultResourceLoader({
    cwd: process.cwd(),
    agentDir: process.cwd(),
    settingsManager,
    noExtensions: true,
    noSkills: true,
    noPromptTemplates: true,
    noThemes: true,
    noContextFiles: true,
    systemPrompt: COACH_PROMPT,
  });
  await resourceLoader.reload();

  return { model, modelRuntime, resourceLoader, settingsManager };
}

const initialization = initializeService()
  .then((initializedService) => {
    service = initializedService;
  })
  .catch(() => {
    initializationError = true;
  });

async function createSession() {
  await initialization;
  if (initializationError || !service) {
    throw new Error("service_unavailable");
  }

  const { session } = await createAgentSession({
    cwd: process.cwd(),
    model: service.model,
    thinkingLevel: THINKING_LEVEL,
    modelRuntime: service.modelRuntime,
    resourceLoader: service.resourceLoader,
    sessionManager: SessionManager.inMemory(process.cwd()),
    settingsManager: service.settingsManager,
    noTools: "all",
  });
  const sessionId = randomUUID();
  sessions.set(sessionId, { session, busy: false });
  return sessionId;
}

const server = createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    await initialization;
    if (initializationError) {
      sendJson(response, 503, { error: "service_unavailable" });
      return;
    }
    sendJson(response, 200, { status: "ok" });
    return;
  }

  if (request.method === "POST") {
    if (request.url === "/v1/sessions") {
      let body;
      try {
        body = await readJsonBody(request);
      } catch {
        sendJson(response, 400, { error: "invalid_request" });
        return;
      }

      if (!isEmptyObject(body)) {
        sendJson(response, 400, { error: "invalid_request" });
        return;
      }

      try {
        const sessionId = await createSession();
        sendJson(response, 201, { sessionId });
      } catch {
        sendJson(response, 503, { error: "service_unavailable" });
      }
      return;
    }

    const messageRoute = /^\/v1\/sessions\/([^/]+)\/messages$/.exec(request.url ?? "");
    if (!messageRoute) {
      sendJson(response, 400, { error: "invalid_request" });
      return;
    }

    let body;
    try {
      body = await readJsonBody(request);
    } catch {
      sendJson(response, 400, { error: "invalid_request" });
      return;
    }

    if (
      body === null
      || typeof body !== "object"
      || Array.isArray(body)
      || Object.keys(body).length !== 1
      || typeof body.message !== "string"
      || body.message.length < 1
      || body.message.length > 4_000
    ) {
      sendJson(response, 400, { error: "invalid_request" });
      return;
    }

    const sessionId = messageRoute[1];
    const sessionRecord = sessions.get(sessionId);
    if (!sessionRecord) {
      sendJson(response, 404, { error: "session_not_found" });
      return;
    }

    if (sessionRecord.busy) {
      sendJson(response, 409, { error: "session_busy" });
      return;
    }

    sessionRecord.busy = true;
    try {
      await sessionRecord.session.prompt(body.message);
      const reply = sessionRecord.session.getLastAssistantText();
      if (typeof reply !== "string" || reply.length === 0) {
        throw new Error("empty_reply");
      }
      sendJson(response, 200, { sessionId, reply });
    } catch {
      sendJson(response, 502, { error: "coach_unavailable" });
    } finally {
      sessionRecord.busy = false;
    }
    return;
  }

  sendJson(response, 405, { error: "method_not_allowed" });
});

async function shutdown() {
  for (const { session } of sessions.values()) {
    session.dispose();
  }
  sessions.clear();
  server.close();
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

server.listen(PORT, HOST);
