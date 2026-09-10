# Validation convention

Every endpoint validates its own request data with a Zod schema, parsed at
the HTTP boundary — not deeper in application/domain code. This keeps "is
this payload well-formed" a concern of the adapter layer, consistent with
the `application`/`adapters` split already in the codebase.

## Where things live

- The schema lives in `src/adapters/http/schemas/v1/<name>.schema.ts` —
  mirrors `controllers/v1/`'s versioning, and keeps every Zod schema in one
  place, clearly marked as an HTTP-layer concern rather than scattered
  per-controller. One `z.object({...})` per validated source (`body`/
  `query`/`params`).
- The generic middleware that applies a schema lives once, at
  `src/server/middlewares/validate.middleware.ts`: `validateRequest(schema, source)`.
- Wire it in the route file, before the controller:

  ```ts
  router.get('/thing', validateRequest(thingQuerySchema, 'query'), controller.handle);
  ```

## Schema vs. DTO — these are not the same thing

It's tempting to let `z.infer<typeof schema>` *be* the type a use case
receives — Zod gives you a validator and a static type in one shot, so why
write a second type? Because the schema validates the **wire format**,
which routinely carries fields the use case has no business seeing.
Concrete example — a registration endpoint's schema:

```ts
// adapters/http/schemas/v1/account.schema.ts
export const createAccountSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8), // HTTP-contract rule: catches typos client-side
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({ code: 'custom', message: 'passwords do not match', path: ['confirmPassword'] });
  }
});
```

`confirmPassword` matters to "did the client submit a well-formed request",
never to "what does creating a user mean" — no domain rule cares about it,
it shouldn't reach a repository, and it has no business inside a use case's
input type. If `z.infer` of this schema *were* the DTO, that use case would
carry a field that exists purely because of how the data arrived over HTTP.

So: the schema (adapter layer, `adapters/http/schemas/`) validates what
came over the wire. A DTO (application layer, `application/dtos/`) is a
plain type describing what a use case needs — no Zod, no HTTP awareness,
just the shape. The controller is the only thing that knows about both, and
its job is exactly to bridge them:

```ts
// application/dtos/create-user.dto.ts
export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  // no confirmPassword — the use case never needs to know it existed
}

// adapters/http/controllers/v1/account.controller.ts
const { name, email, password } = getValidated<CreateAccountBody>(res);
const dto: CreateUserDTO = { name, email, password };
await this.createUserUseCase.execute(dto);
```

Not every endpoint needs this split — one with no use case behind it (like
health below) has nothing to bridge to, so its schema is the only artifact
that exists. Reach for a real `application/dtos/*` type once a use case is
actually involved.

## How a controller reads the validated value

`validateRequest` parses `req[source]` and, on success, assigns the parsed
(and any Zod-coerced/defaulted) value to `res.locals.validated`. Read it with
`getValidated<T>(res)` (same file) instead of `req.query`/`req.body`/
`req.params` or `res.locals.validated` directly — it throws a controlled 500
if the route ever runs the controller without `validateRequest` first,
instead of a raw destructure crash on `undefined`.

## How failures reach the client

On failure, `validateRequest` raises an `HttpError(400, message)`
(`src/adapters/http/errors/http-error.ts`) via `next(err)`. This is the same
shape `error-handler.middleware.ts` already renders for every other error —
no separate validation-error path. The response is the project's existing
`{ statusCode, message, data: null }` error shape, with `message` being
Zod's own `z.prettifyError` output naming the offending field(s).

`HttpError` isn't validation-specific — throw it from anywhere in the
adapter layer (a controller, a middleware) that needs to fail with a
specific HTTP status. It's **adapter-layer only**, though: a status code is
a transport detail, and a use case shouldn't know one exists. When a
business rule fails (e.g. #2's "account already exists"), the use case
throws a domain error from `entities/errors/` instead — no HTTP awareness,
just a meaningful type — and the adapter boundary is what maps that domain
error to the right `HttpError`/status, not the use case constructing one
itself.

## Demonstrated by

`GET /v1/health?verbose=true|false` (`adapters/http/schemas/v1/health.schema.ts` /
`health.routes.ts`): an invalid value (anything other than `true`/`false`)
produces a 400 via the shared error handler; omitting the param, or passing
a valid one, behaves as documented (verbose adds `uptimeSeconds` to the
response). Health has no use case behind it, so there's no DTO here —
see the section above for when one applies.
