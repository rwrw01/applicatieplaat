# Running Tests
- **Framework:** Vitest / Jest.
- **Unit Tests:** Mandatory for all Business Logic (`*.spec.ts`).
- **Integration Tests:** Required for DB and API endpoints.
- **Commands:**
  - Unit: `pnpm test`
  - Coverage: `pnpm test:cov` (80% minimum threshold for new code).
- **TDD:** When fixing bugs, write a failing test first.