// See CONTEXT.md: "A person who registers with name, email and password,
// and authenticates to invest." Mirrors the `users` table (prisma/schema.prisma)
// but is the domain-layer shape — no ORM/HTTP awareness.
export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}
