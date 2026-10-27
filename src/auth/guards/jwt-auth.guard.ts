import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { JwtPayload } from '../auth.types.js';

type AuthenticatedRequest = Request & { user: JwtPayload };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bearer token is required');
    }

    const token = authorization.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException('Bearer token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      if (!Number.isInteger(payload.sub) || !payload.email) {
        throw new UnauthorizedException('Invalid token payload');
      }
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
