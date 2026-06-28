import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PerfilUsuario } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuariosService } from './usuarios.service';

@ApiTags('Usuários')
@ApiBearerAuth()
@Controller('usuarios')
export class UsuariosController {
  constructor(private service: UsuariosService) {}

  @Get()
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.GERENTE)
  @ApiOperation({ summary: 'Listar todos os usuários' })
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @Roles(PerfilUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Criar novo usuário' })
  create(@Body() dto: CreateUsuarioDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(PerfilUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Editar usuário existente' })
  update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
    return this.service.update(id, dto);
  }
}
