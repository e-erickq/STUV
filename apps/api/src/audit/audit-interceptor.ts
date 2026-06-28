import { PrismaClient } from '@prisma/client';
import { AcaoAuditoria } from '@stuv/shared';
import { auditContext } from './audit-context';

// Operações que exigem registro de auditoria
const OPS_CRIAR = new Set(['create', 'createMany']);
const OPS_EDITAR = new Set(['update', 'updateMany', 'upsert']);
const OPS_EXCLUIR = new Set(['delete', 'deleteMany']);
const OPS_AUDITAVEIS = new Set([...OPS_CRIAR, ...OPS_EDITAR, ...OPS_EXCLUIR]);

// Modelos que NÃO devem gerar log (evita recursão em LogAuditoria)
const MODELOS_IGNORADOS = new Set(['logAuditoria']);

/** Serializa valor para JSON compatível com Prisma (converte BigInt). */
function toJson(v: unknown): object | null {
  if (v == null) return null;
  return JSON.parse(JSON.stringify(v, (_, x) => (typeof x === 'bigint' ? x.toString() : x)));
}

/** Determina AcaoAuditoria a partir da operação e dos args. */
export function determineAcao(operation: string, args: Record<string, unknown>): AcaoAuditoria {
  if (OPS_CRIAR.has(operation)) return AcaoAuditoria.CRIACAO;
  if (OPS_EXCLUIR.has(operation)) return AcaoAuditoria.EXCLUSAO;
  const data = (args?.data as Record<string, unknown>) ?? {};
  if ('estado' in data || 'status' in data) return AcaoAuditoria.MUDANCA_ESTADO;
  return AcaoAuditoria.EDICAO;
}

/**
 * Aplica um Proxy sobre cada delegate de modelo na instância do PrismaClient.
 * Propriedades próprias (own properties) da instância têm precedência sobre
 * os getters do protótipo, então todas as chamadas passam pelo Proxy sem
 * alterar nenhum service.
 *
 * @param client    Instância principal (PrismaService)
 * @param rawAudit  Cliente separado usado SOMENTE para gravar LogAuditoria
 *                  (evita recursão infinita)
 */
export function applyAuditProxy(client: PrismaClient, rawAudit: PrismaClient): void {
  // Lista de todos os modelos auditáveis (nomes de propriedade do PrismaClient)
  const modelNames = Object.keys(client).filter(
    (k) => !k.startsWith('$') && !MODELOS_IGNORADOS.has(k),
  );

  for (const modelName of modelNames) {
    const delegate = (client as unknown as Record<string, unknown>)[modelName];
    if (!delegate || typeof delegate !== 'object') continue;

    (client as unknown as Record<string, unknown>)[modelName] = new Proxy(delegate as object, {
      get(target: Record<string, unknown>, operation: string) {
        const fn = target[operation];
        if (typeof fn !== 'function' || !OPS_AUDITAVEIS.has(operation)) {
          return typeof fn === 'function' ? fn.bind(target) : fn;
        }

        return async (args: Record<string, unknown> = {}) => {
          // ── Captura dadosAntes (update / delete com where.id) ──────────
          let dadosAntes: object | null = null;
          if (
            (OPS_EDITAR.has(operation) || OPS_EXCLUIR.has(operation)) &&
            (args?.where as Record<string, unknown>)?.id
          ) {
            dadosAntes = await (target['findUnique'] as Function)
              .call(target, { where: { id: (args.where as Record<string, unknown>).id } })
              .then(toJson)
              .catch(() => null);
          }

          // ── Executa a operação original ────────────────────────────────
          const result: unknown = await (fn as Function).call(target, args);

          // ── Grava log (só se houver contexto de usuário) ───────────────
          const userId = auditContext.getStore()?.userId;
          if (userId) {
            const entidadeId =
              (result as Record<string, unknown>)?.id?.toString() ??
              (args?.where as Record<string, unknown>)?.id?.toString() ??
              'unknown';

            await rawAudit.logAuditoria
              .create({
                data: {
                  entidade: modelName,
                  entidadeId,
                  acao: determineAcao(operation, args) as unknown as any,
                  usuarioId: userId,
                  dadosAntes: dadosAntes ?? undefined,
                  dadosDepois: OPS_EXCLUIR.has(operation) ? undefined : (toJson(result) ?? undefined),
                },
              })
              .catch((err: unknown) => console.error('[Audit] falha ao gravar log:', err));
          }

          return result;
        };
      },
    });
  }
}
