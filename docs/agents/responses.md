# Response convention

One envelope for the whole API, success or failure: `{ statusCode, message,
data }`. A client always checks `data` for the payload and `message` for
what happened — it doesn't need to branch on response shape depending on
whether the call succeeded.

- Error: already implemented in `error-handler.middleware.ts` —
  `{ statusCode: <4xx/5xx>, message: <error text>, data: null }`.
- Success: `src/adapters/http/responses/send-success.ts` —
  `sendSuccess(res, data, { statusCode?, message? })` renders
  `{ statusCode: <default 200>, message: <default 'ok'>, data }`.

Use it from a controller instead of calling `res.json` directly, so the
envelope stays consistent without every controller reconstructing it:

```ts
sendSuccess(res, { balance: 150 });                          // 200, message: "ok"
sendSuccess(res, newAccount, { statusCode: 201, message: 'account created' });
```

`data` can be an object or an array — works the same either way (e.g. a
list endpoint's response is `{ statusCode, message, data: [...] }`).

## What this convention is not

`sendSuccess` only wraps whatever payload the controller already built — it
doesn't decide *what's in* that payload. Field selection, renaming (e.g. the
domain's `snake_case` DB columns vs. a response's `camelCase` fields), and
any computed values are still the controller/use case's job. If that
mapping ever gets non-trivial enough to want a shared helper of its own,
that's a separate concern from this envelope — don't conflate the two.

## Demonstrated by

`GET /v1/health` (`health.controller.ts`) — every response goes through
`sendSuccess`.
