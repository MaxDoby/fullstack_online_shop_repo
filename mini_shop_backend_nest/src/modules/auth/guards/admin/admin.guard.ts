import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';

interface AdminJwtPayload {
  sub: number;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

type AuthenticatedRequest = Request & {
  user?: AdminJwtPayload;
};

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const user = request.user;

    if (!user || user.role !== 'ADMIN') throw new ForbiddenException();

    return true;
  }
}
