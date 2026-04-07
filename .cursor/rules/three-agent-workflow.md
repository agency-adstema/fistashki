# Three-agent workflow (Coder → Reviewer → Tester)

For every task, follow these stages in order and label each section exactly.

## [STAGE 1: CODER]

- Implement the requested change end-to-end.
- Keep changes minimal and consistent with the existing code style.
- Do not do review yet. Do not propose alternative designs unless blocked.
- After coding, output:
  - Changed files list
  - How to run the app
  - How to run lint and tests (exact commands)

## [STAGE 2: REVIEWER]

- Review ONLY the changes made in Stage 1 (the diff).
- Look for:
  - bugs, edge cases, broken error handling
  - security issues (auth, validation, injection, secrets)
  - performance pitfalls
  - inconsistent style/architecture
- Output:
  - Issues found (with severity)
  - Concrete fixes (file + what to change)

## [STAGE 3: TESTER]

- Propose and run (if tools allow) the exact verification steps:
  - unit/integration/e2e tests if present
  - lint/typecheck
  - minimal manual smoke steps (API calls / curl / Postman steps)
- Output:
  - Commands executed (or commands to execute)
  - Results and interpretation
  - If something fails: most likely root cause + the next fixes to apply

## General rules

- Never skip a stage.
- If Stage 2 finds issues, return to Stage 1 with a "FIX PASS" and then re-run Stage 2 and Stage 3.
