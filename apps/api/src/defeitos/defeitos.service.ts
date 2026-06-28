import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EstadoDefeito } from '@stuv/shared';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDefeitoDto } from './dto/create-defeito.dto';
import { UpdateEstadoDefeitoDto } from './dto/update-estado-defeito.dto';

// Máquina de estados — cada chave é o estado atual, os valores são os próximos estados válidos.
export const TRANSICOES_VALIDAS: Record<EstadoDefeito, EstadoDefeito[]> = {
  [EstadoDefeito.ABERTO]: [EstadoDefeito.EM_ANALISE],
  [EstadoDefeito.EM_ANALISE]: [EstadoDefeito.EM_CORRECAO, EstadoDefeito.REJEITADO],
  [EstadoDefeito.EM_CORRECAO]: [EstadoDefeito.RETESTADO],
  [EstadoDefeito.RETESTADO]: [EstadoDefeito.FECHADO],
  [EstadoDefeito.FECHADO]: [],
  [EstadoDefeito.REJEITADO]: [],
};

/** Retorna true se a transição de `de` para `para` é permitida. Função pura. */
export function transicaoValida(de: EstadoDefeito, para: EstadoDefeito): boolean {
  return TRANSICOES_VALIDAS[de]?.includes(para) ?? false;
}

const DEFEITO_SELECT = {
  id: true,
  execucaoId: true,
  autorId: true,
  titulo: true,
  descricao: true,
  gravidade: true,
  estado: true,
  passosReproducao: true,
  criadoEm: true,
  atualizadoEm: true,
  autor: { select: { id: true, nome: true, perfil: true } },
};

@Injectable()
export class DefeitosService {
  constructor(private prisma: PrismaService) {}

  async findAll(gravidade?: string, estado?: string) {
    return this.prisma.defeito.findMany({
      where: {
        ...(gravidade ? { gravidade: gravidade as any } : {}),
        ...(estado ? { estado: estado as any } : {}),
      },
      select: DEFEITO_SELECT,
      orderBy: [{ estado: 'asc' }, { criadoEm: 'desc' }],
    });
  }

  async findByExecucao(execucaoId: string) {
    await this.ensureExecucaoExists(execucaoId);
    return this.prisma.defeito.findMany({
      where: { execucaoId },
      select: DEFEITO_SELECT,
      orderBy: { criadoEm: 'desc' },
    });
  }

  async create(execucaoId: string, dto: CreateDefeitoDto, autorId: string) {
    const execucao = await this.prisma.execucao.findUnique({
      where: { id: execucaoId },
      select: { id: true, resultado: true },
    });
    if (!execucao) throw new NotFoundException('Execução não encontrada.');

    return this.prisma.defeito.create({
      data: {
        execucaoId,
        autorId,
        titulo: dto.titulo,
        descricao: dto.descricao,
        gravidade: dto.gravidade,
        passosReproducao: dto.passosReproducao,
        estado: EstadoDefeito.ABERTO,
      },
      select: DEFEITO_SELECT,
    });
  }

  async updateEstado(id: string, dto: UpdateEstadoDefeitoDto) {
    const defeito = await this.prisma.defeito.findUnique({
      where: { id },
      select: { id: true, estado: true },
    });
    if (!defeito) throw new NotFoundException('Defeito não encontrado.');

    const estadoAtual = defeito.estado as unknown as EstadoDefeito;
    if (!transicaoValida(estadoAtual, dto.estado)) {
      throw new UnprocessableEntityException(
        `Transição inválida: ${estadoAtual} → ${dto.estado}. ` +
          `Transições permitidas: ${(TRANSICOES_VALIDAS[estadoAtual] || []).join(', ') || 'nenhuma'}.`,
      );
    }

    return this.prisma.defeito.update({
      where: { id },
      data: { estado: dto.estado },
      select: DEFEITO_SELECT,
    });
  }

  async delete(id: string) {
    const defeito = await this.prisma.defeito.findUnique({ where: { id }, select: { id: true } });
    if (!defeito) throw new NotFoundException('Defeito não encontrado.');
    await this.prisma.defeito.delete({ where: { id } });
  }

  private async ensureExecucaoExists(execucaoId: string) {
    const exec = await this.prisma.execucao.findUnique({
      where: { id: execucaoId },
      select: { id: true },
    });
    if (!exec) throw new NotFoundException('Execução não encontrada.');
  }
}
