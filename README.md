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

The script presents these scenarios: `air-conditioning`, `sofa-bed`, and `missed-breakfast`. Guest starts the practice. Type `/help` to show help or `/end` to finish and view HEART feedback.

## Practice flow

The Evaluator checks context while you converse. It blocks only clearly out-of-context messages (for example, pizza or football); relevant responses, even poor ones, are accepted and evaluated at the end. For `missed-breakfast`, do not promise free nights, giveaways, cooked-to-order food, food delivered to the room, discounts above 50%, or a room upgrade.

## Validated API

All routes are local and require no public authentication. JSON inputs must match the forms shown exactly.

- `GET /health` → `200` with `{ "status": "ok" }`.
- `POST /trainings` with `{ "scenarioId": "air-conditioning" }` (or `sofa-bed`/`missed-breakfast`) → `201` with `trainingId` and `openingMessage`.
- `POST /trainings/:trainingId/messages` with `{ "message": "..." }` → an `accepted` reply from Guest, or `blocked` with the fixed blocking message.
- `POST /trainings/:trainingId/end` with `{}` → `200` with HEART feedback; the practice ends and is deleted.

Public errors: `400` (invalid input), `404` (missing route or practice), `409` (conflict), `413` (message too large), `429` (maximum active practices reached), `502` (provider failure), `503` (server unavailable), and `504` (timeout).

## Limits and privacy

- Maximum 3 active practices.
- Maximum 20 Team Member messages per practice.
- Each message may contain up to 4,000 characters.
- Each model call has a 90-second limit.
- Practices live only in memory: they are deleted when ended and lost when the server restarts.
- There are no tools, persistence, web interface, or public authentication. The internal model is fixed to `openai-codex/gpt-5.6-terra`.

This documentation reflects real PowerShell testing. Operation depends on the network, provider, and available quota; this is not a production setup.
