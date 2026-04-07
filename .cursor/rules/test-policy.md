# Test policy (applies to Stage 3: TESTER)

Always prefer the project's existing scripts/commands. If any of these exist, run them in this order:

1. Format check (if configured)
2. Lint
3. Typecheck
4. Unit tests
5. Integration tests
6. E2E tests

Rules:

- If a step doesn't exist in the repo, explicitly say "not configured" and move on.
- If any step fails, stop and report:
  - the exact failing command
  - the key error lines
  - the most likely root cause
  - the minimal fix proposal

When the repo is Node/NestJS, check for scripts in package.json such as:
- lint, format, typecheck, test, test:watch, test:e2e, test:cov, build, start:dev
