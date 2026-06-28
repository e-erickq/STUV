import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PerfilUsuario } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  perfil: PerfilUsuario;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'stuv-dev-secret',
    });
  }

  async validate(payload: { sub: string; email: string; perfil: PerfilUsuario }): Promise<AuthUser> {
    return { id: payload.sub, email: payload.email, perfil: payload.perfil };
  }
}
