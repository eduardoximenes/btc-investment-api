// What RegisterUserUseCase needs — no HTTP awareness. See
// docs/agents/validation.md's "Schema vs. DTO" for why this is a distinct
// type from the Zod schema that validates the wire request.
export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
}
