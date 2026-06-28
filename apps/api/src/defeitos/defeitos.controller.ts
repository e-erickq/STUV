import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PerfilUsuario } from '@stuv/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/strategies/jwt.strategy';
import { CreateDefeitoDto } from './dto/create-defeito.dto';
import { UpdateEstadoDefeitoDto } from './dto/update-estado-defeito.dto';
import { DefeitosService } from './defeitos.service';

const { ADMINISTRADOR, GERENTE, TESTADOR } = PerfilUsuario;

/**
 * GET  /api/v1/execucoes/:execucaoId/defeitos  — todos os perfis
 * POST /api/v1/execucoes/:execucaoId/defeitos  — Testador only
 */
@ApiTags('Defeitos')
@ApiBearerAuth()
@Controller('execucoes')
export class DefeitosNestedController {
  constructor(private service: DefeitosService) {}

  @Get(':execucaoId/defeitos')
  @ApiOperation({ summary: 'Listar defeitos de uma execução' })
  findByExecucao(@Param('execucaoId') execucaoId: string) {
    return this.service.findByExecucao(execucaoId);
  }

  @Post(':execucaoId/defeitos')
  @Roles(TESTADOR)
  @ApiOperation({ summary: 'Registrar defeito em uma execução (somente Testador)' })
  create(
    @Param('execucaoId') execucaoId: string,
    @Body() dto: CreateDefeitoDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.create(execucaoId, dto, user.id);
  }
}

/**
 * GET    /api/v1/defeitos          — todos os perfis
 * PATCH  /api/v1/defeitos/:id/estado — todos os perfis (Admin=U, Gerente=U, Testador=U)
 * DELETE /api/v1/defeitos/:id      — Admin only
 */
@ApiTags('Defeitos')
@ApiBearerAuth()
@Controller('defeitos')
export class DefeitosController {
  constructor(private service: DefeitosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os defeitos com filtros opcionais' })
  @ApiQuery({ name: 'gravidade', required: false })
  @ApiQuery({ name: 'estado', required: false })
  findAll(
    @Query('gravidade') gravidade?: string,
    @Query('estado') estado?: string,
  ) {
    return this.service.findAll(gravidade, estado);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Transicionar estado do defeito (máquina de estados)' })
  updateEstado(@Param('id') id: string, @Body() dto: UpdateEstadoDefeitoDto) {
    return this.service.updateEstado(id, dto);
  }

  @Delete(':id')
  @Roles(ADMINISTRADOR)
  @ApiOperation({ summary: 'Excluir defeito (Admin)' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
