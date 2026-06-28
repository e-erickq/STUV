export enum PerfilUsuario {
  ADMINISTRADOR = 'ADMINISTRADOR',
  GERENTE = 'GERENTE',
  TESTADOR = 'TESTADOR',
}

export enum StatusPlano {
  RASCUNHO = 'RASCUNHO',
  ATIVO = 'ATIVO',
  EM_EXECUCAO = 'EM_EXECUCAO',
  CONCLUIDO = 'CONCLUIDO',
}

export enum PrioridadeCasoTeste {
  ALTA = 'ALTA',
  MEDIA = 'MEDIA',
  BAIXA = 'BAIXA',
}

export enum ResultadoExecucao {
  NAO_EXECUTADO = 'NAO_EXECUTADO',
  EM_EXECUCAO = 'EM_EXECUCAO',
  PASSOU = 'PASSOU',
  FALHOU = 'FALHOU',
  BLOQUEADO = 'BLOQUEADO',
  PULADO = 'PULADO',
}

export enum TipoEvidencia {
  IMAGEM = 'IMAGEM',
  LOG = 'LOG',
  ARQUIVO = 'ARQUIVO',
}

export enum GravidadeDefeito {
  CRITICA = 'CRITICA',
  ALTA = 'ALTA',
  MEDIA = 'MEDIA',
  BAIXA = 'BAIXA',
}

export enum EstadoDefeito {
  ABERTO = 'ABERTO',
  EM_ANALISE = 'EM_ANALISE',
  EM_CORRECAO = 'EM_CORRECAO',
  RETESTADO = 'RETESTADO',
  FECHADO = 'FECHADO',
  REJEITADO = 'REJEITADO',
}

export enum AcaoAuditoria {
  CRIACAO = 'CRIACAO',
  EDICAO = 'EDICAO',
  MUDANCA_ESTADO = 'MUDANCA_ESTADO',
  EXCLUSAO = 'EXCLUSAO',
}
