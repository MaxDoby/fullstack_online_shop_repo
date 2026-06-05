import type { Request } from 'express';

export type UserRole = 'USER' | 'ADMIN';

export type AuthenticatedUser = {
  sub: number;
  username: string;
  email: string;
  role: UserRole;
};

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};
