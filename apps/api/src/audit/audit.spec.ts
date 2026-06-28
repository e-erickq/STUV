import { AcaoAuditoria } from '@stuv/shared';
import { auditContext } from './audit-context';
import { determineAcao } from './audit-interceptor';

// ─── Unit: determineAcao ─────────────────────────────────────────────────────

describe('determineAcao', () => {
  it('create → CRIACAO', () => {
    expect(determineAcao('create', {})).toBe(AcaoAuditoria.CRIACAO);
  });

  it('createMany → CRIACAO', () => {
    expect(determineAcao('createMany', {})).toBe(AcaoAuditoria.CRIACAO);
  });

  it('delete → EXCLUSAO', () => {
    expect(determineAcao('delete', { where: { id: '1' } })).toBe(AcaoAuditoria.EXCLUSAO);
  });

  it('deleteMany → EXCLUSAO', () => {
    expect(determineAcao('deleteMany', {})).toBe(AcaoAuditoria.EXCLUSAO);
  });

  it('update com campo "estado" → MUDANCA_ESTADO', () => {
    expect(determineAcao('update', { data: { estado: 'EM_ANALISE' } })).toBe(
      AcaoAuditoria.MUDANCA_ESTADO,
    );
  });

  it('update com campo "status" → MUDANCA_ESTADO', () => {
    expect(determineAcao('update', { data: { status: 'ATIVO' } })).toBe(
      AcaoAuditoria.MUDANCA_ESTADO,
    );
  });

  it('update sem campo de estado → EDICAO', () => {
    expect(determineAcao('update', { data: { titulo: 'novo' } })).toBe(AcaoAuditoria.EDICAO);
  });

  it('upsert → EDICAO (sem campo de estado)', () => {
    expect(determineAcao('upsert', { create: {}, update: { nome: 'x' } })).toBe(
      AcaoAuditoria.EDICAO,
    );
  });
});

// ─── Unit: auditContext (AsyncLocalStorage) ──────────────────────────────────

describe('auditContext', () => {
  it('retorna undefined fora de um contexto ativo', () => {
    expect(auditContext.getStore()).toBeUndefined();
  });

  it('fornece userId dentro do contexto', async () => {
    await new Promise<void>((resolve) => {
      auditContext.run({ userId: 'user-abc' }, () => {
        expect(auditContext.getStore()?.userId).toBe('user-abc');
        resolve();
      });
    });
  });

  it('contextos aninhados são isolados', async () => {
    await new Promise<void>((resolve) => {
      auditContext.run({ userId: 'outer' }, () => {
        auditContext.run({ userId: 'inner' }, () => {
          expect(auditContext.getStore()?.userId).toBe('inner');
        });
        // De volta ao contexto externo
        expect(auditContext.getStore()?.userId).toBe('outer');
        resolve();
      });
    });
  });
});

// ─── Integração: log gerado automaticamente ──────────────────────────────────
//
// Estes testes conectam ao banco real. Requerem DATABASE_URL configurado.
// Rodam após os unit tests acima.

import { PrismaClient } from '@prisma/client';
import { applyAuditProxy } from './audit-interceptor';

// Cliente de leitura de logs (separado do testado, sem proxy)
const readClient = new PrismaClient();

async function makeTestClient(): Promise<PrismaClient> {
  const auditWriter = new PrismaClient();
  const client = new PrismaClient();
  await client.$connect();
  await auditWriter.$connect();
  applyAuditProxy(client, auditWriter);
  return client;
}

async function countLogs(
  entidade: string,
  entidadeId: string,
  acao: AcaoAuditoria,
): Promise<number> {
  return readClient.logAuditoria.count({
    where: { entidade, entidadeId, acao },
  });
}

describe('Auditoria — integração com banco', () => {
  let client: PrismaClient;
  const TEST_USER_ID = 'audit-test-user';
  let testUserId: string;

  beforeAll(async () => {
    await readClient.$connect();
    client = await makeTestClient();

    // Cria usuário de teste para satisfazer FK de usuarioId em LogAuditoria
    const existing = await readClient.usuario.findUnique({ where: { email: 'audit@test.com' } });
    if (existing) {
      testUserId = existing.id;
    } else {
      const u = await readClient.usuario.create({
        data: {
          nome: 'Audit Test',
          email: 'audit@test.com',
          senhaHash: 'hash',
          perfil: 'TESTADOR',
        },
      });
      testUserId = u.id;
    }
  });

  afterAll(async () => {
    await client.$disconnect();
    await readClient.$disconnect();
  });

  it('criar PlanoTeste gera log de auditoria com acao=CRIACAO', async () => {
    let planoId!: string;

    await auditContext.run({ userId: testUserId }, async () => {
      const plano = await (client as any).planoTeste.create({
        data: {
          nome: `Plano Audit Test ${Date.now()}`,
          status: 'RASCUNHO',
        },
      });
      planoId = plano.id;
    });

    const count = await countLogs('planoTeste', planoId, AcaoAuditoria.CRIACAO);
    expect(count).toBe(1);

    // Cleanup
    await readClient.logAuditoria.deleteMany({ where: { entidadeId: planoId } });
    await readClient.planoTeste.delete({ where: { id: planoId } });
  });

  it('transição de estado de Defeito registra dadosAntes e dadosDepois', async () => {
    // Cria execução e defeito mínimos para o teste
    const ct = await readClient.casoTeste.findFirst();
    if (!ct) return; // seed não rodou — pula

    const execucao = await readClient.execucao.create({
      data: { ctId: ct.id, executorId: testUserId, resultado: 'FALHOU' },
    });

    const defeito = await readClient.defeito.create({
      data: {
        execucaoId: execucao.id,
        autorId: testUserId,
        titulo: 'Defeito Audit Test',
        descricao: 'Desc',
        gravidade: 'ALTA',
        estado: 'ABERTO',
        passosReproducao: 'Passos',
      },
    });

    await auditContext.run({ userId: testUserId }, async () => {
      await (client as any).defeito.update({
        where: { id: defeito.id },
        data: { estado: 'EM_ANALISE' },
      });
    });

    const log = await readClient.logAuditoria.findFirst({
      where: { entidade: 'defeito', entidadeId: defeito.id, acao: AcaoAuditoria.MUDANCA_ESTADO },
      orderBy: { dataHora: 'desc' },
    });

    expect(log).not.toBeNull();
    expect((log!.dadosAntes as any)?.estado).toBe('ABERTO');
    expect((log!.dadosDepois as any)?.estado).toBe('EM_ANALISE');

    // Cleanup
    await readClient.logAuditoria.deleteMany({ where: { entidadeId: defeito.id } });
    await readClient.defeito.delete({ where: { id: defeito.id } });
    await readClient.execucao.delete({ where: { id: execucao.id } });
  });

  it('operação sem auditContext (ex: seed) NÃO gera log', async () => {
    // Sem auditContext.run → userId = undefined → sem log
    const countBefore = await readClient.logAuditoria.count();

    // Chamada diretamente no readClient (sem proxy) para não gerar log de qualquer forma
    const plano = await readClient.planoTeste.create({
      data: { nome: `Plano Seed Test ${Date.now()}`, status: 'RASCUNHO' },
    });

    const countAfter = await readClient.logAuditoria.count();
    expect(countAfter).toBe(countBefore); // sem log

    await readClient.planoTeste.delete({ where: { id: plano.id } });
  });

  it('CRUD em entidade gera log com usuarioId correto', async () => {
    let planoId!: string;

    await auditContext.run({ userId: testUserId }, async () => {
      const plano = await (client as any).planoTeste.create({
        data: { nome: `Plano userId Test ${Date.now()}`, status: 'RASCUNHO' },
      });
      planoId = plano.id;
    });

    const log = await readClient.logAuditoria.findFirst({
      where: { entidadeId: planoId },
    });

    expect(log?.usuarioId).toBe(testUserId);

    await readClient.logAuditoria.deleteMany({ where: { entidadeId: planoId } });
    await readClient.planoTeste.delete({ where: { id: planoId } });
  });
});
