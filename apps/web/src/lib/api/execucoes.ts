import { ResultadoExecucao } from '@stuv/shared';
import { api } from './client';

export interface Evidencia {
  id: string;
  tipo: 'IMAGEM' | 'LOG' | 'ARQUIVO';
  urlArquivo: string;
  criadoEm: string;
}

export interface Execucao {
  id: string;
  ctId: string;
  executorId: string;
  resultado: ResultadoExecucao;
  motivo: string | null;
  dataExecucao: string;
  executor: { id: string; nome: string; perfil: string };
  evidencias: Evidencia[];
}

export interface UpdateExecucaoData {
  resultado: ResultadoExecucao;
  motivo?: string;
}

export const execucoesApi = {
  listByCt: (ctId: string): Promise<Execucao[]> =>
    api.get(`/casos-teste/${ctId}/execucoes`).then((r: { data: Execucao[] }) => r.data),

  create: (ctId: string): Promise<Execucao> =>
    api.post(`/casos-teste/${ctId}/execucoes`, {}).then((r: { data: Execucao }) => r.data),

  update: (id: string, data: UpdateExecucaoData): Promise<Execucao> =>
    api.patch(`/execucoes/${id}`, data).then((r: { data: Execucao }) => r.data),

  delete: (id: string): Promise<void> =>
    api.delete(`/execucoes/${id}`).then(() => undefined),

  uploadEvidencia: (id: string, file: File): Promise<Evidencia> => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post(`/execucoes/${id}/evidencias`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r: { data: Evidencia }) => r.data);
  },
};
