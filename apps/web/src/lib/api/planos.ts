import { StatusPlano } from '@stuv/shared';
import { api } from './client';

export interface PlanoTeste {
  id: string;
  nome: string;
  descricao: string | null;
  status: StatusPlano;
  etapaWizardAtual: number;
  criadoEm: string;
  atualizadoEm: string;
  _count?: { casosUso: number };
}

export interface CreatePlanoData {
  nome: string;
  descricao?: string;
  etapaWizardAtual?: number;
}

export interface UpdatePlanoData {
  nome?: string;
  descricao?: string;
  status?: StatusPlano;
  etapaWizardAtual?: number;
}

export const planosApi = {
  list: (): Promise<PlanoTeste[]> =>
    api.get('/planos-teste').then((r: { data: PlanoTeste[] }) => r.data),

  get: (id: string): Promise<PlanoTeste> =>
    api.get(`/planos-teste/${id}`).then((r: { data: PlanoTeste }) => r.data),

  create: (data: CreatePlanoData): Promise<PlanoTeste> =>
    api.post('/planos-teste', data).then((r: { data: PlanoTeste }) => r.data),

  update: (id: string, data: UpdatePlanoData): Promise<PlanoTeste> =>
    api.patch(`/planos-teste/${id}`, data).then((r: { data: PlanoTeste }) => r.data),
};
