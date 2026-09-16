# PC-12: baseline corpus and real-runner proposal

Status: `APPROVED` (`APROBADO CORPUS PC-12`).

This corpus is fictional, contains no real customer/person data, and is used only when real execution is authorized. Its text is not included in the metrics artifact.

## Balance principle

Each repetition has 19 VALIDATE operations: **10 expected BLOCK and 9 expected ALLOW**. This gives greater weight to checking that the Evaluator detects unrelated messages, without removing the ALLOW cases needed to measure false BLOCKs, maintain real conversations, and cover history references.

Latency and accuracy are reported separately for expected BLOCK and expected ALLOW cases. A BLOCK avoids subsequent Character/feedback work and may have a different history, so a difference between the two groups must not be attributed to prompt caching without that separation.

## Executions per repetition

The four sequences run independently in this order, and the complete set is repeated three times. Each `send` is a VALIDATE case; `end` closes the practice. A BLOCK response does not call Character.

| Sequence | Framework / mode / scenario | Step | caseId | Team Member/Coach message | Expected |
| --- | --- | --- | --- | --- | --- |
| H-F | HEART / final / air-conditioning | 1 | greeting | `Hello. I am sorry that the air conditioning kept you awake.` | ALLOW |
| H-F | HEART / final / air-conditioning | 2 | heart-early-unrelated | `What is the capital of Iceland?` | BLOCK |
| H-F | HEART / final / air-conditioning | 3 | weak-relevant | `I understand that this was frustrating.` | ALLOW |
| H-F | HEART / final / air-conditioning | 4 | heart-mid-unrelated | `Can you recommend a recipe for bread?` | BLOCK |
| H-F | HEART / final / air-conditioning | 5 | long-relevant | `I am sorry the rattling noise disrupted your night. I can arrange for maintenance to inspect the unit now, and I will check back with you after they have visited. Would that be a helpful next step?` | ALLOW |
| H-F | HEART / final / air-conditioning | 6 | late-unrelated | `What is the weather like on Mars?` | BLOCK |
| H-F | HEART / final / air-conditioning | 7 | end | — | — |
| H-I | HEART / immediate-and-final / air-conditioning | 1 | reference-precondition | `I understand that the unit kept you awake. Would you like me to arrange maintenance to inspect it now?` | ALLOW |
| H-I | HEART / immediate-and-final / air-conditioning | 2 | immediate-reference | `Yes, I can arrange that now. Would that help?` | ALLOW |
| H-I | HEART / immediate-and-final / air-conditioning | 3 | heart-immediate-unrelated | `What is the square root of 144?` | BLOCK |
| H-I | HEART / immediate-and-final / air-conditioning | 4 | heart-immediate-late-unrelated | `Who painted the Mona Lisa?` | BLOCK |
| H-I | HEART / immediate-and-final / air-conditioning | 5 | end | — | — |
| G-F | GROW / final / kam-career-readiness | 1 | open-question | `What feels most important to you about this opportunity right now?` | ALLOW |
| G-F | GROW / final / kam-career-readiness | 2 | grow-early-unrelated | `What is the fastest animal in the world?` | BLOCK |
| G-F | GROW / final / kam-career-readiness | 3 | earlier-reference-precondition | `What realistic next step toward your PDR objectives would feel manageable this month?` | ALLOW |
| G-F | GROW / final / kam-career-readiness | 4 | earlier-reference | `How would that next step fit with the circumstances you mentioned earlier?` | ALLOW |
| G-F | GROW / final / kam-career-readiness | 5 | grow-late-unrelated | `How many planets are in the solar system?` | BLOCK |
| G-F | GROW / final / kam-career-readiness | 6 | end | — | — |
| G-I | GROW / immediate-and-final / lee-cross-functional-project | 1 | unrelated | `Can you recommend a good recipe for bread?` | BLOCK |
| G-I | GROW / immediate-and-final / lee-cross-functional-project | 2 | late-unrelated-precondition | `What outcome would help you feel more confident when Pat challenges you in a meeting?` | ALLOW |
| G-I | GROW / immediate-and-final / lee-cross-functional-project | 3 | late-unrelated | `What is the weather like on Mars?` | BLOCK |
| G-I | GROW / immediate-and-final / lee-cross-functional-project | 4 | grow-immediate-late-unrelated | `Who wrote Hamlet?` | BLOCK |
| G-I | GROW / immediate-and-final / lee-cross-functional-project | 5 | end | — | — |

`reference-precondition` and `earlier-reference-precondition` are context precursors; they are recorded and measured, but do not replace the eight main properties: unrelated, greeting, weak-relevant, open-question, immediate-reference, earlier-reference, long-relevant, and late-unrelated.

## Coverage and calculated budget

Each repetition has 19 VALIDATE operations: 9 ALLOW and 10 BLOCK. Excluding HEART opening and retries, there are 19 VALIDATE + 9 Character + 3 immediate-feedback + 4 final-feedback = 35 operations. Three repetitions are 105 operations, plus HEART openings and possible retries. This is below the best-effort maximum of 150 calls, 2M tokens, and 60 minutes, but does not guarantee it.

## Calculation criteria

- **Accuracy:** denominator = VALIDATE operations with `outcome: success`, an ALLOW/BLOCK `decision`, and a corpus expectation. Numerator = decisions equal to expectation. Report total and breakdown by expected BLOCK/ALLOW: `eligible`, `correct`, `falseBlock` (expected ALLOW/observed BLOCK), `falseAllow` (expected BLOCK/observed ALLOW), and cases excluded by timeout/error/stopped; never hide them.
- **Cache ratio:** calculate globally and separately by expected BLOCK/ALLOW, only with VALIDATE operations that have complete usage and non-negative numeric values. Formula: `sum(cacheRead) / sum(input + cacheRead + cacheWrite)`. If the denominator is zero or there are no complete records, use `null`. Do not calculate or label CH as an average, quota, billed cost, or savings.
- **Latency:** calculate globally and separately by expected BLOCK/ALLOW, only with VALIDATE operations having `outcome: success`; `durationMs` is monotonic. Ordered median: average the two middle values when n is even. Descriptive p95: value at index `ceil(0.95*n)-1` of the ascending vector. Report n and exclude timeout/error from the calculation while retaining their counts.
- **Tokens/cost:** comparative sums of input, cacheRead, cacheWrite, output, and estimated cost only for complete values; report missing values and partial coverage. Cost is an SDK estimate, not billing or quota.
- **Budget with partial usage (decision B):** retain `knownTokenLowerBound`, the sum of every finite/non-negative observed token field even in incomplete operations. Continue the corpus to prioritize latency and accuracy; if the known lower bound reaches 2M, do not start further operations. If usage is missing, use `usageCoverage:"partial"` and `limitVerified:false`: do not claim real spending or compliance with the limit. Status may be `completed` when the corpus completes; reserve `inconclusive` for latency coverage/results made inconclusive by a stop or error.
- **Retries:** report logical operations, `assistantCompletionsObserved`, `sdkAutoRetriesObserved`, and transport retry as `unknown`; do not claim exact provider-call counts.

## Minimum artifact contract

Path when execution is authorized: `.pi/coordination/research/pc-12-baseline.json`. It is overwritten only with explicit authorization; it is not versioned or published automatically.

```json
{
  "schemaVersion": 1,
  "status": "completed|stopped|inconclusive",
  "runLabel": "pc-12-baseline",
  "stopReason": "budget|auth|provider-failures|timeout|quality-regression|none",
  "planned": { "repetitions": 3, "validateCases": 57, "expectedAllow": 27, "expectedBlock": 30 },
  "counts": {
    "logicalOperations": 0,
    "assistantCompletionsObserved": 0,
    "sdkAutoRetriesObserved": 0,
    "missingUsage": 0,
    "providerTransportRetries": "unknown"
  },
  "tokenBudget": {
    "limit": 2000000,
    "knownTokenLowerBound": 0,
    "usageCoverage": "complete|partial|none",
    "limitVerified": false
  },
  "validate": {
    "overall": {},
    "expectedAllow": {},
    "expectedBlock": {}
  },
  "observations": []
}
```

Each `overall`/`expectedAllow`/`expectedBlock` group contains `accuracy`, `cacheRatio`, `usageTotals`, and `latencyMs` according to the preceding criteria; within groups by expectation, accuracy retains the relevant counters and incompatible counters are zero. Each observation uses only: `caseId`, `repetition`, `stage`, `turn`, `frameworkId`, `feedbackMode`, `durationMs`, `outcome`, `decision`, `expectedDecision`, `assistantCompletionsObserved`, `sdkAutoRetriesObserved`, and nullable usage/`usageComplete`. It contains no messages, prompts, transcripts, private context, response/run/session/training/provider IDs, detailed timestamps, headers, keys, sensitive configuration, or reasoning.

## Authorization record

`APROBADO CORPUS PC-12` authorized Cod to implement this corpus and complete runner **without executing the provider**. The later explicit mandate `EJECUTAR BASELINE PC-12` authorized the completed real baseline execution.
