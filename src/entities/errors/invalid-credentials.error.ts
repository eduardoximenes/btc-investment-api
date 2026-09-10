export class InvalidCredentialsError extends Error {
  constructor() {
    super('invalid password');
    this.name = 'InvalidCredentialsError';
  }
}
