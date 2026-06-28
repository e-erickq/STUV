import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuditMiddleware } from './audit/audit.middleware';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { CasosTesteModule } from './casos-teste/casos-teste.module';
import { CasosUsoModule } from './casos-uso/casos-uso.module';
import { DefeitosModule } from './defeitos/defeitos.module';
import { ExecucoesModule } from './execucoes/execucoes.module';
import { PlanosTesteModule } from './planos-teste/planos-teste.module';
import { PrismaModule } from './prisma/prisma.module';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsuariosModule,
    PlanosTesteModule,
    CasosUsoModule,
    CasosTesteModule,
    ExecucoesModule,
    DefeitosModule,
    RelatoriosModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // AuditMiddleware popula AsyncLocalStorage com o userId antes de qualquer
    // request chegar aos controllers/services. Aplica em todas as rotas.
    consumer.apply(AuditMiddleware).forRoutes('*');
  }
}
