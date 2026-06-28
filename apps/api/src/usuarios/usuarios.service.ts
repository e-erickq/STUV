import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

const SELECT_PUBLIC = {
  id: true,
  nome: true,
  email: true,
  perfil: true,
  criadoEm: true,
  senhaHash: false,
};

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.usuario.findMany({
      select: SELECT_PUBLIC,
      orderBy: { nome: 'asc' },
    });
  }

  async create(dto: CreateUsuarioDto) {
    const existing = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email já cadastrado.');

    const senhaHash = await bcrypt.hash(dto.senha, 12);
    return this.prisma.usuario.create({
      data: { nome: dto.nome, email: dto.email, senhaHash, perfil: dto.perfil },
      select: SELECT_PUBLIC,
    });
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado.');

    if (dto.email && dto.email !== usuario.email) {
      const emailTaken = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
      if (emailTaken) throw new ConflictException('Email já em uso.');
    }

    const data: Record<string, unknown> = {};
    if (dto.nome) data.nome = dto.nome;
    if (dto.email) data.email = dto.email;
    if (dto.perfil) data.perfil = dto.perfil;
    if (dto.senha) data.senhaHash = await bcrypt.hash(dto.senha, 12);

    return this.prisma.usuario.update({ where: { id }, data, select: SELECT_PUBLIC });
  }
}
