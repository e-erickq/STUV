import { EstadoDefeito, GravidadeDefeito } from '@stuv/shared';
import { api } from './client';

export interface Defeito {
  id: string;
  execucaoId: string;
  autorId: string;
  titulo: string;
  descricao: string;
  gravidade: GravidadeDefeito;
  estado: EstadoDefeito;
  passosReproducao: string;
  criadoEm: string;
  atualizadoEm: string;
  autor: { id: string; nome: string; perfil: string };
}

export interface CreateDefeitoData {
  titulo: string;
  descricao: string;
  gravidade: GravidadeDefeito;
  passosReproducao: string;
}

export const defeitosApi = {
  list: (params?: { gravidade?: GravidadeDefeito; estado?: EstadoDefeito }): Promise<Defeito[]> =>
    api
      .get('/defeitos', { params })
      .then((r: { data: Defeito[] }) => r.data),

  listByExecucao: (execucaoId: string): Promise<Defeito[]> =>
    api
      .get(`/execucoes/${execucaoId}/defeitos`)
      .then((r: { data: Defeito[] }) => r.data),

  create: (execucaoId: string, data: CreateDefeitoData): Promise<Defeito> =>
    api
      .post(`/execucoes/${execucaoId}/defeitos`, data)
      .then((r: { data: Defeito }) => r.data),

  updateEstado: (id: string, estado: EstadoDefeito): Promise<Defeito> =>
    api
      .patch(`/defeitos/${id}/estado`, { estado })
      .then((r: { data: Defeito }) => r.data),

  delete: (id: string): Promise<void> =>
    api.delete(`/defeitos/${id}`).then(() => undefined),
};
