import { ResultadoExecucao } from '@stuv/shared';
import { api } from './client';

export type PeriodoRelatorio = '7d' | '30d' | '90d' | '180d' | '365d';

export interface RelatorioFiltros {
  planoId?: string;
  periodo?: PeriodoRelatorio;
  executorId?: string;
  status?: ResultadoExecucao;
}

export interface ExecucaoRelatorio {
  id: string;
  resultado: ResultadoExecucao;
  resultadoLabel: string;
  motivo: string | null;
  dataExecucao: string;
  defeitosCount: number;
  executor: { id: string; nome: string; perfil: string };
  casoTeste: {
    id: string;
    nome: string;
    casoUso: {
      id: string;
      nome: string;
      plano: { id: string; nome: string };
    };
  };
}

export interface RelatorioData {
  geradoEm: string;
  filtros: { planoId: string | null; periodo: string | null; executorId: string | null; status: string | null };
  resumo: { totalExecucoes: number; passRate: number; defeitosAbertos: number; totalDefeitos: number };
  execucoesPorResultado: { resultado: string; label: string; count: number }[];
  defeitosPorGravidade: { gravidade: string; label: string; count: number }[];
  defeitosPorEstado: { estado: string; label: string; count: number }[];
  execucoes: ExecucaoRelatorio[];
}

function buildParams(filtros: RelatorioFiltros, formato?: string) {
  const p: Record<string, string> = {};
  if (filtros.planoId) p.planoId = filtros.planoId;
  if (filtros.periodo) p.periodo = filtros.periodo;
  if (filtros.executorId) p.executorId = filtros.executorId;
  if (filtros.status) p.status = filtros.status;
  if (formato) p.formato = formato;
  return new URLSearchParams(p).toString();
}

export const relatoriosApi = {
  get: (filtros: RelatorioFiltros): Promise<RelatorioData> => {
    const qs = buildParams(filtros);
    return api.get(`/relatorios${qs ? `?${qs}` : ''}`).then((r: { data: RelatorioData }) => r.data);
  },

  downloadUrl: (filtros: RelatorioFiltros, formato: 'pdf' | 'csv'): string => {
    const qs = buildParams(filtros, formato);
    return `http://localhost:3000/api/v1/relatorios?${qs}`;
  },
};
