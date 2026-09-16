# Bruno Electric Independent Audit Protocol — Electrical Tasks Stage 2

MODE: AUDIT ONLY

This branch is for independent verification of the pinned production candidate. Do not modify production/runtime/test files, do not merge, and do not write to `main`.

## Pinned candidate
`AUDITED_HEAD_SHA = c452723c28dbec9cf001b40c3dcf2bd391955e32`

The auditor must inspect that exact SHA. Audit-branch metadata commits are not the production candidate.

## Allowed writes
Only audit evidence under `audits/`, especially the report requested by `audits/TASK_CURRENT.md`.

## Required audit behavior
- independently trace runtime/data paths rather than trusting developer notes;
- verify formulas manually for representative scenarios;
- inspect reference-data values used by the engine;
- verify blank/zero/negative/malformed fail-closed behavior;
- verify continuous vs noncontinuous treatment and MIXED fail-closed behavior;
- verify parallel-conductor constraints and candidate ordering are explicit design policy, not mislabeled as code requirement;
- verify voltage drop uses resistance-only K method and correct parallel effective CMIL;
- verify no power-factor reduction of pure I×R drop;
- verify max-conductor-size constraint and `NO SUPPORTED CONFIGURATION` behavior;
- verify PWA/offline/runtime integration and exact-SHA CI evidence;
- regression-check Stage 0/1 critical boundaries and Job isolation.

## Severity
- P0: catastrophic data/code/safety failure, destructive corruption, materially unsafe deterministic electrical result.
- P1: primary workflow/data-integrity/math/code-semantics failure that can produce materially wrong or misleading output.
- P2: non-blocking correctness/UX/coverage issue.
- P3: minor polish/documentation issue.

## Verdict
- A — ACCEPT: no P0/P1.
- B — ACCEPT AFTER MINOR FIXES: no P0/P1; P2/P3 only.
- C — REJECT / REWORK REQUIRED: one or more P0/P1.

The chat response from the independent auditor should contain only:
VERDICT
AUDITED HEAD SHA
BLOCKERS
REPORT LINK
