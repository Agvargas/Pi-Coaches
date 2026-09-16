# Pi-Coach

Local practice server with a validated catalog of compatible frameworks, currently HEART and GROW. It runs on `127.0.0.1:3000` and is used through an interactive PowerShell chat. Each practice uses isolated Character and Evaluator sessions.

## Requirements and installation

- Node.js 24 (verified).
- Local Pi authentication configured for the SDK.
- Network access to the provider; each model call may consume quota.

From the project directory:

```powershell
npm ci
npm start
```

Leave the server running in that console. In another console, start the chat:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\chat.ps1
```

The client first loads the public catalog, then lets you choose HEART or GROW, a scenario, and either `Final` or `Immediate and final` feedback. Invalid menu input repeats the current menu. The framework menu includes `0 Exit` and Help after the options; scenario and feedback menus include `0 Exit`, Help after the options, and Back after Help.

HEART has `air-conditioning`, `sofa-bed`, and `missed-breakfast`; it starts with the Character speaking. GROW has `kam-career-readiness`, `lee-cross-functional-project`, `kam-change-strategy`, and `lee-presentation-feedback`; it shows the selected public context and waits for the Coach (`user-opens-with-context`). The catalog exposes public metadata and context only, not private context, profiles, or prompts. During practice, type a coaching response. `/help` explains the available commands, `/end` gets final feedback and returns to framework selection, and `/exit` cancels without feedback and exits the client.

## Practice flow

The Evaluator checks context while you converse. It blocks only clearly out-of-context messages (for example, pizza or football); relevant responses, even poor ones, are accepted and evaluated at the end. For `missed-breakfast`, do not promise free nights, giveaways, cooked-to-order food, food delivered to the room, discounts above 50%, or a room upgrade.

## Framework package administration

Framework packages are maintained under `training-content/frameworks/`. The server discovers and validates them at startup. Changes require a server restart and apply to new practices; there is no hot reload, HTTP administration, or editing API. Invalid packages are skipped and are not exposed in the public catalog.

The HTTP layer, training engine, SDK session factory, and content loader remain separate (`src/server.mjs`, `src/training-service.mjs`, `src/sdk-session-factory.mjs`, and `src/training-content.mjs`). Package fields cannot configure executable code, models, providers, thinking, or tools.

## Adding a framework package

This is a documentation guide, not an API or installer. A compatible package has this shape:

```text
training-content/frameworks/<framework-id>/
├── manifest.json
├── prompts/
│   ├── character.md
│   ├── evaluator.md
│   └── immediate-feedback.md
├── scenarios.json
└── characters/                 (optional per scenario)
    └── <character-id>.md
```

The manifest must use the closed set of fields `id`, `displayName`, `startMode`, `feedbackModes`, `finalFeedbackMode`, `characterPromptFile`, `evaluatorPromptFile`, `immediateFeedbackPromptFile`, and `scenariosFile`. All three prompt references are required, but they may point to the same file; a separate `immediate-feedback.md` file is not required. `startMode` is `character-opens` or `user-opens-with-context`; feedback modes are `final` and/or `immediate-and-final`; the final mode is `EVALUATE` or `FINAL_EVALUATE`. References accepted by the loader match `^(?:prompts|characters)/[a-z][a-z0-9-]*\.md$`; using `prompts/` for prompts and `characters/` for profiles is a convention, not a requirement. `scenariosFile` is `scenarios.json`. Referenced files must be non-empty UTF-8 files no larger than 64 KiB.

`scenarios.json` contains one or more scenarios (up to 20). Each scenario has public fields `id`, `displayName`, and `publicContext`; `privateContext` remains private on the server. The optional `characterProfileFile` is an internal reference, not public metadata. Framework and scenario IDs must match `^[a-z][a-z0-9-]{0,63}$`; the manifest ID must match the package directory name, and scenario IDs must be unique. Public catalog output contains only IDs, display names, supported feedback modes, and `publicContext`; private context, profiles, and prompt text stay server-side. The loader validates the complete package at startup, and only valid packages are published. If no valid package remains, initialization fails and health/catalog requests return `503` rather than exposing an empty catalog.

## Validated API

All routes are local and require no public authentication. JSON inputs must match the forms shown exactly.

- `GET /health` → `200` with `{ "status": "ok" }`.
- `GET /frameworks` → `200` with the public framework catalog, including selectable framework, scenario, and feedback metadata/context.
- `POST /trainings` with `{ "frameworkId": "...", "scenarioId": "...", "feedbackMode": "final" }` or `"immediate-and-final"` → `201` with the practice opening data.
- `POST /trainings/:trainingId/messages` with `{ "message": "..." }` → the next practice response and, when configured, immediate feedback.
- `POST /trainings/:trainingId/end` with `{}` → `200` with final feedback; the practice ends and is deleted.
- `DELETE /trainings/:trainingId` → cancels the practice without feedback.

Public errors include `400` (invalid input), `404` (missing route or practice), `409` (conflict), `413` (message too large), `429` (maximum active practices reached), `502` (provider failure), `503` (server unavailable), and `504` (timeout).

## Limits and privacy

- Maximum 3 active practices.
- Maximum 20 Team Member messages per practice.
- Each message may contain up to 4,000 characters.
- Each model call has a 90-second limit.
- Practices live only in memory: they are deleted when ended or canceled and lost when the server restarts.
- A finished or canceled practice cannot be reused.
- A provider failure may close the practice and ask you to start another one.
- There are no tools, persistence, web interface, or public authentication.
- Advanced retry behavior is outside the current scope.

This documentation reflects real PowerShell testing. Operation depends on the network, provider, and available quota; this is not a production setup.
