# Validation convention

Every endpoint validates its own request data with a Zod schema, parsed at
the HTTP boundary — not deeper in application/domain code. This keeps "is
this payload well-formed" a concern of the adapter layer, consistent with
the `application`/`adapters` split already in the codebase.

## Where things live

- The schema lives next to the controller/route it validates:
  `src/adapters/http/controllers/v1/<name>.schema.ts`, exporting one
  `z.object({...})` per validated source (`body`/`query`/`params`).
- The generic middleware that applies a schema lives once, at
  `src/server/middlewares/validate.middleware.ts`: `validateRequest(schema, source)`.
- Wire it in the route file, before the controller:

  ```ts
  router.get('/thing', validateRequest(thingQuerySchema, 'query'), controller.handle);
  ```

## How a controller reads the validated value

`validateRequest` parses `req[source]` and, on success, assigns the parsed
(and any Zod-coerced/defaulted) value to `res.locals.validated`. Read it with
`getValidated<T>(res)` (same file) instead of `req.query`/`req.body`/
`req.params` or `res.locals.validated` directly — it throws a controlled 500
if the route ever runs the controller without `validateRequest` first,
instead of a raw destructure crash on `undefined`.

## How failures reach the client

On failure, `validateRequest` raises an `HttpError(400, message)`
(`src/application/errors/http-error.ts`) via `next(err)`. This is the same
shape `error-handler.middleware.ts` already renders for every other error —
no separate validation-error path. The response is the project's existing
`{ statusCode, message, data: null }` error shape, with `message` being
Zod's own `z.prettifyError` output naming the offending field(s).

`HttpError` isn't validation-specific — throw it from anywhere (a
controller, a use case) that needs to fail with a specific HTTP status,
e.g. `throw new HttpError(409, 'account already exists')`.

## Demonstrated by

`GET /v1/health?verbose=true|false` (`health.schema.ts` / `health.routes.ts`):
an invalid value (anything other than `true`/`false`) produces a 400 via the
shared error handler; omitting the param, or passing a valid one, behaves as
documented (verbose adds `uptimeSeconds` to the response).
