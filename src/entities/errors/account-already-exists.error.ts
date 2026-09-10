export class AccountAlreadyExistsError extends Error {
  constructor() {
    super('account already exists');
    this.name = 'AccountAlreadyExistsError';
  }
}
