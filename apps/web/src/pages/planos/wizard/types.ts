import { z } from 'zod';

export interface HistoricoRow {
  versao: string;
  data: string;
  autor: string;
  descricao: string;
}

export interface TipoTesteRow {
  tipo: string;
  objetivo: string;
  tecnica: string;
  ferramentas: string;
  criterios: string;
}

export interface InfraRow {
  item: string;
  descricao: string;
}

export interface MembroEquipe {
  nome: string;
  papel: string;
  responsabilidades: string;
}

export interface ConflitosRow {
  periodo: string;
  descricao: string;
  impacto: string;
}

export interface RelatorioRow {
  tipo: string;
  frequencia: string;
  destinatario: string;
}

export interface WizardFormData {
  // Step 1 — Identificação
  nomeProjeto: string;
  siglaProjeto: string;
  nomeRequisitante: string;
  gerenteProjeto: string;
  dataInicio: string;
  dataTermino: string;
  versaoDocumento: string;
  dataDocumento: string;
  elaboradoPor: string;
  cenarioOperacional: string;
  // Step 2 — Complementação
  finalidade: string;
  escopo: string;
  objetivos: string;
  introducao: string;
  historico: HistoricoRow[];
  // Step 3 — Missão
  missaoAvaliacao: string;
  motivadores: string[];
  // Step 4 — Restrições
  restricoes: string;
  premissas: string;
  dependencias: string;
  // Step 5 — Abordagem
  abordagemGeral: string;
  tiposTeste: TipoTesteRow[];
  artefatosEntrada: string[];
  artefatosSaida: string[];
  // Step 6 — Artefatos e Infra
  infraHardware: InfraRow[];
  infraSoftware: InfraRow[];
  // Step 7 — Equipe e Comunicação
  equipe: MembroEquipe[];
  conflitos: ConflitosRow[];
  relatorios: RelatorioRow[];
  componentesIntegracao: string;
  reunioes: string;
  criteriosSuspensao: string;
}

export const WIZARD_DEFAULT: WizardFormData = {
  nomeProjeto: '',
  siglaProjeto: '',
  nomeRequisitante: '',
  gerenteProjeto: '',
  dataInicio: '',
  dataTermino: '',
  versaoDocumento: '1.0',
  dataDocumento: new Date().toISOString().split('T')[0],
  elaboradoPor: '',
  cenarioOperacional: '',
  finalidade: '',
  escopo: '',
  objetivos: '',
  introducao: '',
  historico: [],
  missaoAvaliacao: '',
  motivadores: [],
  restricoes: '',
  premissas: '',
  dependencias: '',
  abordagemGeral: '',
  tiposTeste: [],
  artefatosEntrada: [],
  artefatosSaida: [],
  infraHardware: [],
  infraSoftware: [],
  equipe: [],
  conflitos: [],
  relatorios: [],
  componentesIntegracao: '',
  reunioes: '',
  criteriosSuspensao: '',
};

// Per-step zod schemas
export const stepSchemas: Record<number, z.ZodObject<z.ZodRawShape>> = {
  1: z.object({
    nomeProjeto: z.string().min(3, 'Nome do projeto é obrigatório (mín. 3 caracteres).'),
    siglaProjeto: z.string().min(2, 'Sigla é obrigatória.'),
    dataInicio: z.string().min(1, 'Data de início é obrigatória.'),
    dataTermino: z.string().min(1, 'Data de término é obrigatória.'),
  }),
  2: z.object({
    finalidade: z.string().min(10, 'Finalidade é obrigatória (mín. 10 caracteres).'),
    escopo: z.string().min(10, 'Escopo é obrigatório.'),
    objetivos: z.string().min(10, 'Objetivos são obrigatórios.'),
  }),
  3: z.object({
    missaoAvaliacao: z.string().min(10, 'Missão de avaliação é obrigatória.'),
  }),
  4: z.object({
    restricoes: z.string().min(5, 'Restrições são obrigatórias.'),
    premissas: z.string().min(5, 'Premissas são obrigatórias.'),
  }),
  5: z.object({
    abordagemGeral: z.string().min(10, 'Abordagem geral é obrigatória.'),
  }),
  6: z.object({}),
  7: z.object({
    componentesIntegracao: z.string().min(3, 'Componentes de integração são obrigatórios.'),
    reunioes: z.string().min(3, 'Reuniões são obrigatórias.'),
  }),
};

export const WIZARD_STEPS = [
  { id: 1, title: 'Identificação do Projeto' },
  { id: 2, title: 'Complementação do Projeto' },
  { id: 3, title: 'Missão de Avaliação' },
  { id: 4, title: 'Restrições e Premissas' },
  { id: 5, title: 'Abordagem dos Testes' },
  { id: 6, title: 'Artefatos e Infraestrutura' },
  { id: 7, title: 'Equipe e Comunicação' },
] as const;
