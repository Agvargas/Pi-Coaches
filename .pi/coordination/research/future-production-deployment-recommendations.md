# Future Production Deployment Recommendations

## Status

Research and planning guidance only. This document does not authorize a production deployment, a provider change, new credentials, persistence, public access, or any product implementation.

## Current Baseline

Pi-Coach is currently a local Node.js training server. It runs on loopback, uses the Pi SDK installed as a project dependency, and creates in-memory Guest and Evaluator sessions for each HEART practice.

The server process is separate from any Pi terminal session. It does not communicate with development terminals or `pi-link`. In the current local environment, the SDK can use authentication already available to the local operating-system user. This local convenience must not be treated as a production authentication design.

## Production Principle

A production deployment should run as an independent service environment. It should install the repository's declared dependencies, receive provider access through managed deployment configuration, and create its own runtime and practice sessions. It must not depend on a developer workstation, an interactive personal login, or a running Pi terminal.

## Recommended Future Architecture

```text
User client
    |
HTTPS and authenticated application access
    |
Pi-Coach service
    |-- Guest session lifecycle
    |-- Evaluator session lifecycle
    |-- training state, limits, cleanup, and audit-safe logs
    |
Approved model provider using managed server credentials
```

The exact hosting platform, client type, provider, model, and credential mechanism remain future decisions.

## Deployment Preparation

Before a production trial, define a repeatable environment setup:

1. Use a supported Node.js version and install dependencies from the lockfile with `npm ci`.
2. Deploy the approved repository revision rather than copying a developer's local installation.
3. Run the service with a dedicated service account and minimal operating-system permissions.
4. Separate development, test/staging, and production environments.
5. Record the approved runtime version, dependency version, deployment revision, and rollback procedure.
6. Verify `/health` and approved application behavior after deployment without exposing internal diagnostics publicly.

The project-local `node_modules` directory is created during installation and is not stored in Git. A remote server therefore installs its own copy of the Pi SDK from the declared dependency version.

## Provider Authentication and Model Access

A remote service needs its own authorized provider access before it can create Guest and Evaluator sessions.

Recommended conditions:

- Select a provider, model, and server-appropriate authentication method explicitly.
- Prefer a dedicated service credential or managed workload identity over a developer's interactive personal subscription login.
- Store credentials only in the hosting platform's secret manager or equivalent protected deployment configuration.
- Never commit credentials, place them in source files, print them in logs, or return them through HTTP responses.
- Confirm model availability, pricing, rate limits, geographic constraints, and provider usage terms before deployment.
- Define credential rotation, revocation, owner, and incident-response procedures.

The currently configured provider/model choice must be revalidated for the selected production credential type. It must not be assumed that local access implies deployable server access.

## Network and Application Security

The current loopback-only server is appropriate for local testing. It should not simply be exposed to the internet.

A future public or organizational deployment should define:

- HTTPS termination and certificate management.
- User authentication and authorization.
- A reverse proxy, gateway, or equivalent controlled ingress.
- Request-size limits, rate limits, abuse controls, and per-user or per-tenant quotas.
- Network firewall rules and least-privilege outbound provider access.
- Safe public error messages that do not reveal provider internals, prompts, transcripts, or credentials.
- Security review of all new routes and any future browser or voice client.

## Session State and Reliability

Today, practices are intentionally in memory. A process restart ends active practices and invalidates their IDs. This is acceptable for the current local scope.

Before production, decide which behavior is required:

- **Ephemeral practices:** retain in-memory state, clearly communicate restart behavior, and use one service instance or session affinity.
- **Resumable practices:** introduce approved persistence, data retention rules, encryption, cleanup, and recovery behavior.
- **Multiple service instances:** use a deliberate shared state or routing design so a training ID consistently reaches the correct service instance.

The design must retain the current safety properties: isolated Guest and Evaluator sessions, server-controlled opaque IDs, operation locks, timeouts, disposal on end/shutdown, and bounded active practices.

## Privacy and Data Handling

Training conversations may contain personal or operational information. Define before production:

- What transcript data is collected, why it is needed, and how long it is retained.
- Whether any content is stored after `/end`.
- Who may access logs or transcripts.
- Redaction rules for logs, support records, and error reporting.
- Consent, notice, and organizational policy requirements.
- Procedures for deletion requests and incident response.

If voice/audio is introduced later, define separate microphone consent, audio-retention, transcription, and provider-data-handling policies.

## Operations and Cost Control

A production service should provide operational visibility without leaking sensitive data:

- Health and readiness checks.
- Structured, redacted logs.
- Metrics for request failures, timeouts, active practices, provider latency, and rate-limit events.
- Alerts for provider failures, unusually high cost, authentication failure, or repeated abuse.
- Budget limits and ownership for model usage.
- Controlled retry behavior that does not duplicate conversations or unexpectedly increase cost.

## Testing and Release Process

Before exposing the service to users:

1. Test in a non-production environment with separate credentials.
2. Verify startup, provider availability, Guest/Evaluator isolation, limits, error handling, shutdown, and cleanup.
3. Run human HEART QA through the supported client.
4. Test authentication, authorization, invalid input, rate limits, restart behavior, and observability.
5. Perform a security and privacy review.
6. Use a rollback plan and gradual release where appropriate.

## Decisions Required Before Implementation

A future approved production slice should resolve at least:

1. Hosting platform and deployment ownership.
2. Provider, model, server authentication method, and budget owner.
3. Whether the service remains local/internal or becomes accessible remotely.
4. Client type and user authentication method.
5. Ephemeral versus persistent training sessions.
6. Transcript and audio retention/privacy policy.
7. Scaling, uptime, monitoring, support, and incident-response expectations.
8. Whether voice/audio is a separate phase after text production readiness.

## Suggested Delivery Sequence

1. Create an approved production-design task; do not alter the current local server by assumption.
2. Select provider authentication and a private test environment.
3. Build a minimal secure staging deployment with the current text-only behavior.
4. Validate security, operations, costs, session lifecycle, and HEART QA.
5. Decide whether to add persistence, a public client, or voice capabilities in separate approved slices.

## Sources

- Current Pi-Coach implementation in `src/server.mjs`.
- Current project rules in `AGENTS.md`.
- Installed Pi SDK documentation on `ModelRuntime`, `AgentSession`, model providers, and custom providers.

No remote deployment, credential inspection, provider login, or model call was performed for this research.
