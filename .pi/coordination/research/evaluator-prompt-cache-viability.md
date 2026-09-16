# Prompt caching viability for VALIDATE in Pi-Coach

> PC-11 research. Read-only; it does not authorize implementation, configuration changes, or provider experiments.

## Short answer

`CH0.0%` in the Pi terminal is neither remaining quota nor a cumulative Pi-Coach metric. It is the cache-read rate for the last visible assistant response in that development session. It neither demonstrates a historic cache miss nor directly measures the server's VALIDATE calls.

Pi-Coach already retains a session key that the Codex adapter can use as `prompt_cache_key`. This makes prompt-caching measurement viable, but it cannot promise savings or lower latency without a controlled experiment. The recommended first candidate is to remove only the redundant copy of the Evaluator prompt from the VALIDATE body, while retaining the system prompt, scenario, and transcript.

## What CH measures

The TUI calculates the rate for the last assistant entry using normalized usage:

```text
100 * cacheRead / (input + cacheRead + cacheWrite)
```

It displays one decimal place. The footer displays it only when the session total contains a cache read or write. R/W indicators and cost are aggregated at session level, but CH is not: compaction, summaries, or earlier messages do not turn CH into a time-based average.

Therefore, `CH0.0%` means that the last response had zero cache reads or a ratio that rounds to zero. It does not prove a historic absence of caching, available quota, or the behavior of a different Pi-Coach practice.

## What prefix caching can and cannot save

Prompt caching reuses processing of a matching input prefix at the provider. It may reduce input cost and prefill time when the provider applies a cache hit.

It does not reuse a previous `ALLOW` response, remove the request, remove output/reasoning generation, or avoid the subsequent Character call. It is also not equivalent to subscription quota; SDK estimated cost does not certify billing or quota use.

## Pi-Coach and Codex findings

- The Codex adapter uses `sessionId` as `prompt_cache_key` unless `cacheRetention: "none"` is set.
- Pi-Coach in-memory sessions already retain that affinity per session. Character and Evaluator sessions, and separate practices, do not share the key.
- The body uses `store:false`; this does not prove that prompt caching is disabled.
- No TTL, minimum-token threshold, hit guarantee, or quota effect was verified for Terra/Codex. The five-minute reference found concerns an inactive WebSocket connection, not a prompt-cache TTL.
- `AgentSession.prompt` exposes no public `cacheRetention` control; there is no reason to add extensions or intercept payloads.

Each VALIDATE retains the Evaluator session, but adds the Evaluator prompt, mode, scenario, growing transcript, and message to the body again. The append-only history retains previous validations. This can increase total input approximately quadratically as turns grow. A stable prefix can still produce cache hits: high CH and growing total cost are not contradictory.

## Option viability

| Option | Viability | Recommendation |
| --- | --- | --- |
| A. Remove duplicated instructions | High, narrow change | First candidate; remove only the redundant evaluatorPrompt copy in VALIDATE. |
| B. Lower thinking for VALIDATE | Viable, changes behavior | Separate experiment; change and restore the level under the lock. |
| C. Control history | Possible, but complex | Not as the first change; a new session or cleared messages may lose context/affinity. |
| E. Separate validator | Possible, architectural change | Independent decision; another session alone does not reduce calls or context. |

Do not block by keywords, automatically allow on Evaluator failure, or start Character in parallel before ALLOW.

## Recommended experiment, pending approval

Compare the current baseline with option A only, without mixing thinking, model, history, or another session. Use a reviewed fictional HEART/GROW corpus: unrelated message, weak relevant intervention, ambiguous message, immediate reference to the preceding turn, earlier reference, long text, and pressure to change role.

Proposal: 8 cases × 2 variants × 3 repetitions = at most 48 validations; use continued sessions to observe cold and warm candidates. Measure per VALIDATE: monotonic duration, input, cacheRead/cacheWrite, output, estimated cost, errors/retries, and decision against a human label. Aggregate weighted cache rate, median, and descriptive p95; do not average CH or use it without absolute tokens.

Suggested gates: at most 60 calls including auxiliary calls, 1M tokens, and 30 minutes; monetary/quota budget requires a human decision. Stop at a limit, authentication error, two consecutive provider failures, or an anaphora regression. Accept only if there are no new incorrect classifications and lower absolute input together with repeated improvement in duration/estimated cost is observed.

## Evidence consulted

- `.pi/coordination/research/prototype-feedback-recommendations.md`, section 5.
- `src/training-service.mjs`, `src/sdk-session-factory.mjs`, dependency 0.84.4.
- `node_modules/@earendil-works/pi-coding-agent/dist/modes/interactive/components/footer.js` (CH).
- `node_modules/@earendil-works/pi-coding-agent/dist/core/sdk.js` (sessionId).
- `node_modules/@earendil-works/pi-ai/dist/api/openai-codex-responses.js`, `openai-responses-shared.js`, `types.d.ts`, and README (adapter, usage, and preferences).

## Limits

No real calls, network, authentication, or secrets were used. There was no evidence of hit/miss or real-practice latency/cost. Any change to prompts, thinking, history, sessions, or model requires a separate approved task and Sdk/Cod/Rev/human-QA review.
