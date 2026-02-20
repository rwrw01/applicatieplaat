# Security Guidelines
- **Security by Design:** Apply OWASP Top 10 principles (Injection, Broken Auth, Sensitive Data Exposure) by default.
- **Assume Breach:** Never trust internal networks or previous layers. Always validate/authorize at the entry of every function/service.
- **Transport:** Enforce TLS/HTTPS for all connections. Use secure protocols for inter-service communication.
- **Secrets:** Zero tolerance for hardcoded credentials. Use Environment Variables or Secret Managers.
- **Input/Output:** Sanitize all inputs (Injection) and escape all outputs (XSS). Use parameterized queries only.
- **Auth:** Implement robust session management and JWT validation. Use "Least Privilege" for all service accounts/DB users.
- **Dependency Safety:** Audit packages for CVEs. Avoid "blind" updates of unverified dependencies.