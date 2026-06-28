import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PerfilUsuario } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePlanoDto } from './dto/create-plano.dto';
import { UpdatePlanoDto } from './dto/update-plano.dto';
import { PlanoTesteService } from './planos-teste.service';

@ApiTags('Planos de Teste')
@ApiBearerAuth()
@Controller('planos-teste')
export class PlanoTesteController {
  constructor(private service: PlanoTesteService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os planos de teste' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe de um plano de teste' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.GERENTE)
  @ApiOperation({ summary: 'Criar novo plano de teste' })
  create(@Body() dto: CreatePlanoDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(PerfilUsuario.ADMINISTRADOR, PerfilUsuario.GERENTE)
  @ApiOperation({ summary: 'Atualizar plano de teste (inclui etapaWizardAtual)' })
  update(@Param('id') id: string, @Body() dto: UpdatePlanoDto) {
    return this.service.update(id, dto);
  }
}
