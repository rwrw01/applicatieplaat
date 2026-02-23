# CLAUDE.md
> Checked into git. Everyone (human and Claude) contributes.
> Task-specific context lives in `.claude/notes/`.
> Subdirectory rules live in `<dir>/CLAUDE.md`.
> After every correction, end with: "Update CLAUDE.md so you don't make that mistake again."

---

## Stack & Tooling

- **Runtime:** [Node 20 / Python 3.12 / etc.]
- **Framework:** [SvelteKit / FastAPI / etc.]
- **Language:** TypeScript strict mode
- **Style:** Small functions; no clever abstractions; prefer `type` over `interface`; NEVER use `enum` (use string literal unions instead)

---

## Workflow

### Required order for every task
1. Start in **Plan Mode** — iterate until the plan is solid before touching code
2. Wait for approval, then switch to auto-accept
3. Implement — one behavior change at a time, never bundle tasks
4. Run verification (see below) — fix all failures before continuing
5. Summarize the diff: changed files, risks, backwards-incompatible changes

### Prompting patterns
- After a mediocre fix: *"Knowing everything you know now, scrap this and implement the elegant solution"*
- Before a PR: *"Grill me on these changes and don't make a PR until I pass your test"*

---

## Verification (required after every change)

```bash
bun run typecheck   # Run first — fast feedback
bun run test        # Never skip; fix failures before continuing
bun run lint        # Run before every commit
bun run build       # Confirm nothing is broken end-to-end
```

Never say "should work." Run the commands. Explain what output confirms success.

---

## Rules

- Never rename public APIs without asking first
- Never change formatting config or modify unrelated files in the same change
- If unsure, propose 2 options and ask which to proceed with
- High-risk changes (security, auth, data) require explicit human approval

---

## Slash Commands

| Command | Purpose |
|---|---|
| `/commit-push-pr` | Commit, push, and open a PR |
| `/techdebt` | Find and eliminate duplicated code |
| `/verify-app` | End-to-end verification steps |

Commands live in `.claude/commands/` and are shared via git.

---

## Permissions (pre-allowed)

See `.claude/settings.json` for shared team permissions.
Avoid `--dangerously-skip-permissions`; use `/permissions` instead.

---

## MCP Integrations

- **GitHub:** PR monitoring; Claude fixes CI failures in the background

---

## Learnings

See `.claude/notes/LEARNINGS.md` — Claude appends rules there after every correction.
