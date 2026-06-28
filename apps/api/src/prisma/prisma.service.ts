import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { applyAuditProxy } from '../audit/audit-interceptor';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /** Cliente separado usado SOMENTE para gravar logs de auditoria. */
  private readonly auditWriter = new PrismaClient();

  async onModuleInit() {
    await this.$connect();
    await this.auditWriter.$connect();
    // Aplica proxy de auditoria sobre todos os delegates de modelo desta instância.
    // Own properties têm precedência sobre getters do protótipo — todos os services
    // continuam usando this.prisma.modelo sem qualquer mudança.
    applyAuditProxy(this, this.auditWriter);
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.auditWriter.$disconnect();
  }
}
