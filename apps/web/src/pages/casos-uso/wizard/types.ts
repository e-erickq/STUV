import { z } from 'zod';

export interface UCFormData {
  nome: string;
  descricao: string;
  atores: string;
  fluxoPrincipal: string;
  fluxosAlternativos: string;
}

export const UC_DEFAULT: UCFormData = {
  nome: '',
  descricao: '',
  atores: '',
  fluxoPrincipal: '',
  fluxosAlternativos: '',
};

export const UC_STEPS = [
  { id: 1, title: 'Informações Básicas' },
  { id: 2, title: 'Fluxo Principal' },
  { id: 3, title: 'Fluxos Alternativos e Revisão' },
] as const;

export const ucStepSchemas: Record<number, z.ZodObject<z.ZodRawShape>> = {
  1: z.object({
    nome: z.string().min(3, 'Nome é obrigatório (mín. 3 caracteres).'),
  }),
  2: z.object({
    fluxoPrincipal: z.string().min(10, 'Descreva o fluxo principal (mín. 10 caracteres).'),
  }),
  3: z.object({}),
};
