# PC-12 — VALIDATE baseline report

Status: real execution completed and accepted by human QA as the comparison reference.

## Executed conditions

- Approved PC-12 corpus: 3 repetitions, HEART/GROW, and `final`/`immediate-and-final` modes.
- 57 planned validations: 27 expected ALLOW and 30 expected BLOCK.
- Runner: `scripts/baseline-harness.mjs`, artifact schema 1.
- Configured limits: 150 operations, 2M tokens, and 60 minutes, on a best-effort basis.

## Result

| Metric | Result |
| --- | ---: |
| Status / stop | `completed` / `none` |
| Observed logical operations | 111 |
| Executed validations | 57 / 57 |
| VALIDATE accuracy | 57 / 57 (100%) |
| False BLOCK / false ALLOW | 0 / 0 |
| Observed assistant completions | 111 |
| Observed SDK retries | 0 |
| Transport retries | `unknown` |
| Incomplete usage | 0 |
| Known token lower bound, all stages | 215,722 |

## VALIDATE latency

| Group | n | Median | Descriptive p95 |
| --- | ---: | ---: | ---: |
| Total | 57 | 1,655 ms | 3,221 ms |
| Expected ALLOW | 27 | 1,756 ms | 3,221 ms |
| Expected BLOCK | 30 | 1,588 ms | 2,353 ms |

BLOCK and ALLOW groups are reported separately: a difference between them does not by itself demonstrate a caching effect because their history and subsequent flow differ.

## Observed VALIDATE tokens/cache

| Group | Input | Cache read | Output | Weighted cache ratio |
| --- | ---: | ---: | ---: | ---: |
| Total | 92,138 | 38,144 | 339 | 29.28% |
| Expected ALLOW | 36,448 | 12,544 | 155 | 25.60% |
| Expected BLOCK | 55,690 | 25,600 | 184 | 31.49% |

`cacheWrite` was 0. The ratio is `cacheRead / (input + cacheRead + cacheWrite)`; it is not the TUI CH metric, quota, billing, or savings.

The SDK reported an estimated VALIDATE cost of 0.1959728. This is an SDK estimate, not billed cost or subscription quota.

## Limits and cautions

- The known token lower bound remained below 2M and usage was complete, but the artifact retains `limitVerified:false`; no certification of provider spending/limit is claimed.
- The runner observed no SDK retries and cannot guarantee that internal transport retries did not occur.
- This baseline supports comparing latency and decisions with a future candidate using the same corpus, model, content, limits, and order. It does not yet prove that a caching optimization reduces latency or authorize implementation of one.

## Artifact

- Sanitized data: `.pi/coordination/research/pc-12-baseline.json`
- It contains no messages, prompts, transcripts, session IDs, headers, credentials, or reasoning.
