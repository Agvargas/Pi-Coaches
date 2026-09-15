# Pi-Coach

Local HEART practice server. It runs on `127.0.0.1:3000` and is used through an interactive PowerShell chat. The server creates two isolated internal sessions per practice: Guest (low level) and Evaluator (medium level).

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

The client first loads the public catalog, then lets you choose a framework, a scenario, and either `Final` or `Immediate and final` feedback. Invalid menu input repeats the current menu. The framework menu includes `0 Exit` and Help after the options; scenario and feedback menus include `0 Exit`, Help after the options, and Back after Help.

For HEART, the three scenarios are `air-conditioning`, `sofa-bed`, and `missed-breakfast`. HEART starts with the Character speaking; GROW shows the public Context and waits for the Coach. During practice, type a coaching response. `/help` explains the available commands, `/end` gets final feedback and returns to framework selection, and `/exit` cancels without feedback and exits the client.

## Practice flow

The Evaluator checks context while you converse. It blocks only clearly out-of-context messages (for example, pizza or football); relevant responses, even poor ones, are accepted and evaluated at the end. For `missed-breakfast`, do not promise free nights, giveaways, cooked-to-order food, food delivered to the room, discounts above 50%, or a room upgrade.

## HEART content administration

The HEART training content is maintained on the server in repository files under `training-content/heart/`. The server validates this content at startup. An administrator with server access may edit the content files, but changes require a server restart and apply only to new practices. There is no HTTP reload or editing endpoint. The scenario IDs remain `air-conditioning`, `sofa-bed`, and `missed-breakfast`; the public blocked response remains fixed.

## Modular structure

The confirmed implementation separates responsibilities into four modules: `src/server.mjs` handles HTTP, `src/training-service.mjs` runs the training flow, `src/sdk-session-factory.mjs` creates SDK sessions, and `src/training-content.mjs` loads and validates HEART content. The declarative `training-content/heart/manifest.json` identifies the fixed HEART content files; it does not execute code or configure models or tools. This structure does not add framework selection, package selection through the API, or dynamic reloading.

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
