# Communication Patterns
- **REST:** Strictly follow HTTP verbs (GET=read, POST=create, PUT=replace, PATCH=update).
- **DTOs:** Use Data Transfer Objects for all incoming/outgoing data payloads.
- **Async:** Use events for side-effects that do not require immediate consistency.
- **Idempotency:** Ensure mutating operations are safe to retry.