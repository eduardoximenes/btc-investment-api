## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues; skills use the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five canonical labels (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `CONTEXT.md` + `docs/adr/`. See `docs/agents/domain.md`.

### Validation convention

Zod schema parsed at the controller boundary via `validateRequest`; failures
reuse the existing error-handler shape. See `docs/agents/validation.md`.

### Response convention

One envelope for the whole API: `{ statusCode, message, data }`, success or
failure. Use `sendSuccess` from a controller. See `docs/agents/responses.md`.
