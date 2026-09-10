// A plain Error carrying an HTTP status. error-handler.middleware.ts already
// duck-types any thrown error's numeric `.status` into the response code —
// this is just a convenient, typed way to construct one.
//
// Adapter-layer only (controllers, middlewares) — a status code is a
// transport detail. A use case that needs to fail with business meaning
// (e.g. "account already exists") should throw a domain error from
// entities/errors/ instead; the adapter boundary maps that to an HttpError
// (or a plain object with the right `.status`), not the other way around.
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}
