import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCasoUsoDto } from './dto/create-caso-uso.dto';
import { UpdateCasoUsoDto } from './dto/update-caso-uso.dto';

const UC_SELECT = {
  id: true,
  planoId: true,
  nome: true,
  descricao: true,
  atores: true,
  fluxoPrincipal: true,
  fluxosAlternativos: true,
  criadoEm: true,
  _count: { select: { casosTeste: true } },
};

@Injectable()
export class CasosUsoService {
  constructor(private prisma: PrismaService) {}

  async findByPlano(planoId: string) {
    await this.ensurePlanoExists(planoId);
    return this.prisma.casoUso.findMany({
      where: { planoId },
      select: UC_SELECT,
      orderBy: { criadoEm: 'asc' },
    });
  }

  async create(planoId: string, dto: CreateCasoUsoDto) {
    await this.ensurePlanoExists(planoId);
    return this.prisma.casoUso.create({
      data: {
        planoId,
        nome: dto.nome,
        descricao: dto.descricao,
        atores: dto.atores,
        fluxoPrincipal: dto.fluxoPrincipal ?? '',
        fluxosAlternativos: dto.fluxosAlternativos,
      },
      select: UC_SELECT,
    });
  }

  async update(id: string, dto: UpdateCasoUsoDto) {
    await this.ensureUcExists(id);
    return this.prisma.casoUso.update({
      where: { id },
      data: dto,
      select: UC_SELECT,
    });
  }

  private async ensurePlanoExists(planoId: string) {
    const plano = await this.prisma.planoTeste.findUnique({ where: { id: planoId }, select: { id: true } });
    if (!plano) throw new NotFoundException('Plano de teste não encontrado.');
  }

  private async ensureUcExists(id: string) {
    const uc = await this.prisma.casoUso.findUnique({ where: { id }, select: { id: true } });
    if (!uc) throw new NotFoundException('Caso de uso não encontrado.');
  }
}
