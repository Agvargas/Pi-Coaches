#!/usr/bin/env node
// Intentionally inert unless a future human authorization supplies this exact flag.
if (!process.argv.includes("--approved-baseline")) throw new Error("baseline_not_approved");
const { TrainingService } = await import("../src/training-service.mjs");
const BUDGET = { operations: 150, tokens: 2_000_000, milliseconds: 60 * 60 * 1000 };
export function sanitizeArtifact(value) { return { schemaVersion: 1, status: ["completed", "stopped", "inconclusive"].includes(value?.status) ? value.status : "inconclusive", counts: { operations: Number(value?.counts?.operations) || 0, retries: Number(value?.counts?.retries) || 0 }, aggregates: value?.aggregates && typeof value.aggregates === "object" ? { durationMs: Number(value.aggregates.durationMs) || 0 } : {} }; }
// A future authorized runner must supply literal corpus and output path; this file never writes by itself.
const service = new TrainingService();
try { if (BUDGET.operations < 1) throw new Error("budget_exhausted"); throw new Error("baseline_corpus_not_authorized"); } finally { await service.shutdown(); }
