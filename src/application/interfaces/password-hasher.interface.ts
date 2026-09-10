// Abstracts the hashing algorithm (bcrypt, per issue #19's Implementation
// Decisions) behind an application-layer port, so a use case depends on
// "can hash/compare a password" rather than on bcrypt directly.
export interface IPasswordHasher {
  hash(plainText: string): Promise<string>;
  compare(plainText: string, hash: string): Promise<boolean>;
}

export const PASSWORD_HASHER = 'IPasswordHasher';
