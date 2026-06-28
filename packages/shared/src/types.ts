import {
  AcaoAuditoria,
  EstadoDefeito,
  GravidadeDefeito,
  PerfilUsuario,
  PrioridadeCasoTeste,
  ResultadoExecucao,
  StatusPlano,
  TipoEvidencia,
} from './enums';

export interface IUsuario {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  criadoEm: Date;
}

export interface IPlanoTeste {
  id: string;
  nome: string;
  descricao: string | null;
  status: StatusPlano;
  etapaWizardAtual: number;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface ICasoUso {
  id: string;
  planoId: string;
  nome: string;
  descricao: string | null;
  atores: string | null;
  fluxoPrincipal: string;
  fluxosAlternativos: string | null;
  criadoEm: Date;
}

export interface ICasoTeste {
  id: string;
  ucId: string;
  nome: string;
  preCondicoes: string | null;
  passos: string;
  resultadoEsperado: string;
  prioridade: PrioridadeCasoTeste;
  criadoEm: Date;
}

export interface IExecucao {
  id: string;
  ctId: string;
  executorId: string;
  resultado: ResultadoExecucao;
  motivo: string | null;
  dataExecucao: Date;
}

export interface IEvidencia {
  id: string;
  execucaoId: string;
  tipo: TipoEvidencia;
  urlArquivo: string;
  criadoEm: Date;
}

export interface IDefeito {
  id: string;
  execucaoId: string;
  autorId: string;
  titulo: string;
  descricao: string;
  gravidade: GravidadeDefeito;
  estado: EstadoDefeito;
  passosReproducao: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface ILogAuditoria {
  id: string;
  entidade: string;
  entidadeId: string;
  acao: AcaoAuditoria;
  usuarioId: string;
  dataHora: Date;
  dadosAntes: Record<string, unknown> | null;
  dadosDepois: Record<string, unknown> | null;
}
