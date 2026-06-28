import { PrioridadeCasoTeste } from '@stuv/shared';
import { api } from './client';

export interface CasoTeste {
  id: string;
  ucId: string;
  nome: string;
  preCondicoes: string | null;
  passos: string;
  resultadoEsperado: string;
  prioridade: PrioridadeCasoTeste;
  criadoEm: string;
  _count?: { execucoes: number };
}

export interface CreateCasoTesteData {
  nome: string;
  preCondicoes?: string;
  passos: string;
  resultadoEsperado: string;
  prioridade?: PrioridadeCasoTeste;
}

export interface UpdateCasoTesteData {
  nome?: string;
  preCondicoes?: string;
  passos?: string;
  resultadoEsperado?: string;
  prioridade?: PrioridadeCasoTeste;
}

export const casosTesteApi = {
  listByUc: (ucId: string): Promise<CasoTeste[]> =>
    api.get(`/casos-uso/${ucId}/casos-teste`).then((r: { data: CasoTeste[] }) => r.data),

  create: (ucId: string, data: CreateCasoTesteData): Promise<CasoTeste> =>
    api.post(`/casos-uso/${ucId}/casos-teste`, data).then((r: { data: CasoTeste }) => r.data),

  update: (id: string, data: UpdateCasoTesteData): Promise<CasoTeste> =>
    api.patch(`/casos-teste/${id}`, data).then((r: { data: CasoTeste }) => r.data),
};
