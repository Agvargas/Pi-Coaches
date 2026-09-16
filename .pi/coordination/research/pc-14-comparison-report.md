# PC-14 comparison report

## Scope and conditions

PC-14 compared the original VALIDATE request body with one candidate: removing the duplicate Evaluator prompt from the `VALIDATE` body while preserving it as the Evaluator system prompt. The corpus, framework/mode mix, expected decisions, content, model/runtime settings, session behavior, and execution limits were preserved from PC-12. Each run used fresh sessions per practice; the Evaluator session persisted within each practice.

Four completed runs were executed in this order: `original-1`, `candidate-1`, `candidate-2`, `original-2`. Each run used the PC-12 corpus: 57 VALIDATE cases (27 expected ALLOW and 30 expected BLOCK). The artifacts retain the legacy `runLabel` `pc-12-baseline` for runner compatibility; `benchmark.variant` and `benchmark.execution` disambiguate the PC-14 runs.

## Integrity

All four runs completed with `stopReason: none`: 4/4 completed. They recorded 444 logical operations, 228/228 correct VALIDATE decisions, zero observed SDK retries, complete usage, and a 703,191 known-token lower bound. Transport retries are unknown. Budget checks were best-effort; `limitVerified` remains false.

## Results by run

| Run | Median (ms) | p95 (ms) | Input | Cache read | Output | Weighted cache ratio | SDK cost estimate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| original-1 | 1,837.914 | 4,863.088 | 90,069 | 39,936 | 331 | 30.72% | 0.1920972 |
| candidate-1 | 1,501.500 | 3,198.678 | 64,133 | 10,752 | 357 | 14.36% | 0.1347004 |
| candidate-2 | 1,838.064 | 3,148.679 | 69,258 | 5,376 | 429 | 7.20% | 0.1447392 |
| original-2 | 1,652.163 | 3,344.320 | 85,581 | 44,544 | 377 | 34.23% | 0.1845948 |

The weighted cache ratio is cache-read tokens divided by input plus cache-read and cache-write tokens. It is not a billing, quota, or TUI metric.

## Aggregated original versus candidate

Each aggregate contains 114 VALIDATE cases (two runs).

| Variant | Median (ms) | p95 (ms) | Input | Cache read | Output | SDK cost estimate | Weighted cache ratio |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Original | 1,810.194 | 3,494.596 | 175,650 | 84,480 | 708 | 0.3766920 | 32.48% |
| Candidate | 1,644.156 | 3,148.679 | 133,391 | 16,128 | 786 | 0.2794396 | 10.79% |

Both variants were exact: 114/114 VALIDATE decisions correct. Relative to the original aggregate, the candidate shows a 9.2% lower median, 9.9% lower p95, 24.1% lower input, and 25.8% lower SDK cost estimate. Total cache-inclusive input (input plus cache read) decreased by 42.5%.

## Comparison with PC-12

The accepted PC-12 baseline was 1,655.364 ms median, 3,221.333 ms p95, input 92,138, cache read 38,144, output 339, SDK cost estimate 0.1959728, and a 29.28% weighted cache ratio for one 57-case run. Candidate totals per run reduce cache-inclusive input by approximately 42.6% versus PC-12 and reduce the estimated cost by approximately 28.7%. Historical latency is only 0.7% lower at the median and 2.3% lower at p95; these are descriptive comparisons, not causal evidence.

Run order matters. Candidate-2 had a 1,838.064 ms median versus 1,501.500 ms for candidate-1, and the original runs also varied (1,837.914 ms versus 1,652.163 ms). The observed result therefore should not be treated as a guaranteed latency improvement.

## Interpretation and acceptance

The candidate produced fewer cache reads/hits and a lower weighted cache ratio. The demonstrated benefit is reduced request context and a lower SDK estimate in this corpus, not better cache reuse, guaranteed speed, billed savings, or quota savings. The human responsible accepted the candidate after the four-run execution as a context/estimated-cost reduction with corpus-specific correctness.

This acceptance does not constitute HTTP or general product acceptance. It covers only the controlled PC-14 comparison and does not establish a general latency or cache guarantee.

## Privacy and artifacts

The four sanitized artifacts and this report contain benchmark metadata and execution aggregates only. They do not publish messages, prompts, transcripts, session IDs, secrets, headers, or reasoning.

Artifacts:

- `pc-14-original-1.json`
- `pc-14-candidate-1.json`
- `pc-14-candidate-2.json`
- `pc-14-original-2.json`
- `pc-14-comparison-report.md`
