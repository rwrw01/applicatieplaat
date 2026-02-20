# Service Architecture
- **Layered Pattern:**
  - `Domain`: Pure business logic (zero dependencies).
  - `Application`: Services and Use Cases.
  - `Infrastructure`: DB implementations, external API clients.
  - `Interface`: Controllers, CLI, or UI components.
- **Separation:** Logic must never reside directly in the transport layer (HTTP/Queue).
- **Dependencies:** Use Dependency Injection to invert dependencies where possible.