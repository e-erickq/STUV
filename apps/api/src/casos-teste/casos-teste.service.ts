import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCasoTesteDto } from './dto/create-caso-teste.dto';
import { UpdateCasoTesteDto } from './dto/update-caso-teste.dto';

const CT_SELECT = {
  id: true,
  ucId: true,
  nome: true,
  preCondicoes: true,
  passos: true,
  resultadoEsperado: true,
  prioridade: true,
  criadoEm: true,
  _count: { select: { execucoes: true } },
};

@Injectable()
export class CasosTesteService {
  constructor(private prisma: PrismaService) {}

  async findByUc(ucId: string) {
    await this.ensureUcExists(ucId);
    return this.prisma.casoTeste.findMany({
      where: { ucId },
      select: CT_SELECT,
      orderBy: [{ prioridade: 'asc' }, { criadoEm: 'asc' }],
    });
  }

  async create(ucId: string, dto: CreateCasoTesteDto) {
    await this.ensureUcExists(ucId);
    return this.prisma.casoTeste.create({
      data: {
        ucId,
        nome: dto.nome,
        preCondicoes: dto.preCondicoes,
        passos: dto.passos,
        resultadoEsperado: dto.resultadoEsperado,
        prioridade: dto.prioridade ?? 'MEDIA',
      },
      select: CT_SELECT,
    });
  }

  async update(id: string, dto: UpdateCasoTesteDto) {
    await this.ensureCtExists(id);
    return this.prisma.casoTeste.update({
      where: { id },
      data: dto,
      select: CT_SELECT,
    });
  }

  private async ensureUcExists(ucId: string) {
    const uc = await this.prisma.casoUso.findUnique({ where: { id: ucId }, select: { id: true } });
    if (!uc) throw new NotFoundException('Caso de uso não encontrado.');
  }

  private async ensureCtExists(id: string) {
    const ct = await this.prisma.casoTeste.findUnique({ where: { id }, select: { id: true } });
    if (!ct) throw new NotFoundException('Caso de teste não encontrado.');
  }
}
