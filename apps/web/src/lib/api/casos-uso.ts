import { api } from './client';

export interface CasoUso {
  id: string;
  planoId: string;
  nome: string;
  descricao: string | null;
  atores: string | null;
  fluxoPrincipal: string;
  fluxosAlternativos: string | null;
  criadoEm: string;
  _count?: { casosTeste: number };
}

export interface CreateCasoUsoData {
  nome: string;
  descricao?: string;
  atores?: string;
  fluxoPrincipal?: string;
  fluxosAlternativos?: string;
}

export interface UpdateCasoUsoData {
  nome?: string;
  descricao?: string;
  atores?: string;
  fluxoPrincipal?: string;
  fluxosAlternativos?: string;
}

export const casosUsoApi = {
  listByPlano: (planoId: string): Promise<CasoUso[]> =>
    api.get(`/planos-teste/${planoId}/casos-uso`).then((r: { data: CasoUso[] }) => r.data),

  create: (planoId: string, data: CreateCasoUsoData): Promise<CasoUso> =>
    api.post(`/planos-teste/${planoId}/casos-uso`, data).then((r: { data: CasoUso }) => r.data),

  update: (id: string, data: UpdateCasoUsoData): Promise<CasoUso> =>
    api.patch(`/casos-uso/${id}`, data).then((r: { data: CasoUso }) => r.data),
};
