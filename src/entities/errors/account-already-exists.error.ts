// Domain error, no HTTP awareness (see docs/agents/validation.md's "How
// failures reach the client"). The adapter boundary (account.controller.ts)
// maps this to an HttpError(400, ...) with the exact message issue #19
// specifies — the use case itself never constructs a status code.
export class AccountAlreadyExistsError extends Error {
  constructor() {
    super('account already exists');
    this.name = 'AccountAlreadyExistsError';
  }
}
