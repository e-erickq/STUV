import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ResultadoExecucao, TipoEvidencia } from '@stuv/shared';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExecucaoDto } from './dto/create-execucao.dto';
import { UpdateExecucaoDto } from './dto/update-execucao.dto';

const EXEC_SELECT = {
  id: true,
  ctId: true,
  executorId: true,
  resultado: true,
  motivo: true,
  dataExecucao: true,
  executor: { select: { id: true, nome: true, perfil: true } },
  evidencias: { select: { id: true, tipo: true, urlArquivo: true, criadoEm: true } },
};

const RESULTADO_COM_MOTIVO = new Set<ResultadoExecucao>([
  ResultadoExecucao.FALHOU,
  ResultadoExecucao.BLOQUEADO,
]);

@Injectable()
export class ExecucoesService {
  constructor(private prisma: PrismaService) {}

  async findByCt(ctId: string) {
    await this.ensureCtExists(ctId);
    return this.prisma.execucao.findMany({
      where: { ctId },
      select: EXEC_SELECT,
      orderBy: { dataExecucao: 'desc' },
    });
  }

  async create(ctId: string, dto: CreateExecucaoDto, executorId: string) {
    await this.ensureCtExists(ctId);
    return this.prisma.execucao.create({
      data: {
        ctId,
        executorId,
        resultado: dto.resultado ?? ResultadoExecucao.NAO_EXECUTADO,
      },
      select: EXEC_SELECT,
    });
  }

  async update(id: string, dto: UpdateExecucaoDto) {
    await this.ensureExecucaoExists(id);

    if (RESULTADO_COM_MOTIVO.has(dto.resultado) && !dto.motivo?.trim()) {
      throw new BadRequestException('Motivo é obrigatório quando resultado é FALHOU ou BLOQUEADO.');
    }

    return this.prisma.execucao.update({
      where: { id },
      data: { resultado: dto.resultado, motivo: dto.motivo ?? null },
      select: EXEC_SELECT,
    });
  }

  async delete(id: string) {
    await this.ensureExecucaoExists(id);
    await this.prisma.execucao.delete({ where: { id } });
  }

  async createEvidencia(id: string, file: Express.Multer.File) {
    await this.ensureExecucaoExists(id);

    const ext = path.extname(file.originalname).toLowerCase();
    const tipo: TipoEvidencia = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)
      ? TipoEvidencia.IMAGEM
      : ext === '.log' || ext === '.txt'
      ? TipoEvidencia.LOG
      : TipoEvidencia.ARQUIVO;

    const urlArquivo = `/uploads/${file.filename}`;

    return this.prisma.evidencia.create({
      data: { execucaoId: id, tipo, urlArquivo },
      select: { id: true, tipo: true, urlArquivo: true, criadoEm: true },
    });
  }

  private async ensureCtExists(ctId: string) {
    const ct = await this.prisma.casoTeste.findUnique({ where: { id: ctId }, select: { id: true } });
    if (!ct) throw new NotFoundException('Caso de teste não encontrado.');
  }

  private async ensureExecucaoExists(id: string) {
    const exec = await this.prisma.execucao.findUnique({ where: { id }, select: { id: true } });
    if (!exec) throw new NotFoundException('Execução não encontrada.');
  }
}
