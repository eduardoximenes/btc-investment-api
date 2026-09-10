export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export type PublicUser = Omit<User, 'passwordHash'>;