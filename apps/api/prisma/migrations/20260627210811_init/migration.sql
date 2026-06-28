-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('ADMINISTRADOR', 'GERENTE', 'TESTADOR');

-- CreateEnum
CREATE TYPE "StatusPlano" AS ENUM ('RASCUNHO', 'ATIVO', 'EM_EXECUCAO', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "PrioridadeCasoTeste" AS ENUM ('ALTA', 'MEDIA', 'BAIXA');

-- CreateEnum
CREATE TYPE "ResultadoExecucao" AS ENUM ('NAO_EXECUTADO', 'EM_EXECUCAO', 'PASSOU', 'FALHOU', 'BLOQUEADO', 'PULADO');

-- CreateEnum
CREATE TYPE "TipoEvidencia" AS ENUM ('IMAGEM', 'LOG', 'ARQUIVO');

-- CreateEnum
CREATE TYPE "GravidadeDefeito" AS ENUM ('CRITICA', 'ALTA', 'MEDIA', 'BAIXA');

-- CreateEnum
CREATE TYPE "EstadoDefeito" AS ENUM ('ABERTO', 'EM_ANALISE', 'EM_CORRECAO', 'RETESTADO', 'FECHADO', 'REJEITADO');

-- CreateEnum
CREATE TYPE "AcaoAuditoria" AS ENUM ('CRIACAO', 'EDICAO', 'MUDANCA_ESTADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "perfil" "PerfilUsuario" NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planos_teste" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "status" "StatusPlano" NOT NULL DEFAULT 'RASCUNHO',
    "etapaWizardAtual" INTEGER NOT NULL DEFAULT 1,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planos_teste_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "casos_uso" (
    "id" TEXT NOT NULL,
    "planoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "atores" TEXT,
    "fluxoPrincipal" TEXT NOT NULL,
    "fluxosAlternativos" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "casos_uso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "casos_teste" (
    "id" TEXT NOT NULL,
    "ucId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "preCondicoes" TEXT,
    "passos" TEXT NOT NULL,
    "resultadoEsperado" TEXT NOT NULL,
    "prioridade" "PrioridadeCasoTeste" NOT NULL DEFAULT 'MEDIA',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "casos_teste_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "execucoes" (
    "id" TEXT NOT NULL,
    "ctId" TEXT NOT NULL,
    "executorId" TEXT NOT NULL,
    "resultado" "ResultadoExecucao" NOT NULL DEFAULT 'NAO_EXECUTADO',
    "motivo" TEXT,
    "dataExecucao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "execucoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidencias" (
    "id" TEXT NOT NULL,
    "execucaoId" TEXT NOT NULL,
    "tipo" "TipoEvidencia" NOT NULL,
    "urlArquivo" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "defeitos" (
    "id" TEXT NOT NULL,
    "execucaoId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "gravidade" "GravidadeDefeito" NOT NULL,
    "estado" "EstadoDefeito" NOT NULL DEFAULT 'ABERTO',
    "passosReproducao" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "defeitos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_auditoria" (
    "id" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "acao" "AcaoAuditoria" NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dadosAntes" JSONB,
    "dadosDepois" JSONB,

    CONSTRAINT "logs_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "casos_uso" ADD CONSTRAINT "casos_uso_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "planos_teste"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casos_teste" ADD CONSTRAINT "casos_teste_ucId_fkey" FOREIGN KEY ("ucId") REFERENCES "casos_uso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execucoes" ADD CONSTRAINT "execucoes_ctId_fkey" FOREIGN KEY ("ctId") REFERENCES "casos_teste"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execucoes" ADD CONSTRAINT "execucoes_executorId_fkey" FOREIGN KEY ("executorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_execucaoId_fkey" FOREIGN KEY ("execucaoId") REFERENCES "execucoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defeitos" ADD CONSTRAINT "defeitos_execucaoId_fkey" FOREIGN KEY ("execucaoId") REFERENCES "execucoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defeitos" ADD CONSTRAINT "defeitos_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
