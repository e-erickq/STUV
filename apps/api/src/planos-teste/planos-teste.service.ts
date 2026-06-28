import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanoDto } from './dto/create-plano.dto';
import { UpdatePlanoDto } from './dto/update-plano.dto';

const LIST_SELECT = {
  id: true,
  nome: true,
  descricao: true,
  status: true,
  etapaWizardAtual: true,
  criadoEm: true,
  atualizadoEm: true,
  _count: { select: { casosUso: true } },
};

@Injectable()
export class PlanoTesteService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.planoTeste.findMany({
      select: LIST_SELECT,
      orderBy: { atualizadoEm: 'desc' },
    });
  }

  async findOne(id: string) {
    const plano = await this.prisma.planoTeste.findUnique({
      where: { id },
      include: {
        casosUso: {
          select: {
            id: true,
            nome: true,
            _count: { select: { casosTeste: true } },
          },
        },
      },
    });
    if (!plano) throw new NotFoundException('Plano de teste não encontrado.');
    return plano;
  }

  create(dto: CreatePlanoDto) {
    return this.prisma.planoTeste.create({
      data: {
        nome: dto.nome,
        descricao: dto.descricao,
        status: 'RASCUNHO',
        etapaWizardAtual: dto.etapaWizardAtual ?? 1,
      },
      select: LIST_SELECT,
    });
  }

  async update(id: string, dto: UpdatePlanoDto) {
    await this.findOne(id);
    return this.prisma.planoTeste.update({
      where: { id },
      data: dto,
      select: LIST_SELECT,
    });
  }
}
