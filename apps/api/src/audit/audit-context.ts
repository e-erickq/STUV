import { AsyncLocalStorage } from 'async_hooks';

export interface AuditStore {
  userId: string;
}

/** Singleton compartilhado entre middleware HTTP e PrismaService. */
export const auditContext = new AsyncLocalStorage<AuditStore>();
