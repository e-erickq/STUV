import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { auditContext } from './audit-context';

/** Extrai o userId do JWT sem reverificação (JwtAuthGuard já faz isso depois). */
function decodeUserId(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(authHeader.slice(7).split('.')[1], 'base64url').toString(),
    );
    return payload?.sub ?? null;
  } catch {
    return null;
  }
}

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const userId = decodeUserId(req.headers.authorization);
    if (userId) {
      auditContext.run({ userId }, next);
    } else {
      next();
    }
  }
}
