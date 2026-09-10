// A plain Error carrying an HTTP status. error-handler.middleware.ts already
// duck-types any thrown error's numeric `.status` into the response code —
// this is just a convenient, typed way to construct one, usable from
// adapters (e.g. request validation) or application-layer use cases alike
// (e.g. a 409 for "account already exists").
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}
