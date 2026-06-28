import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CasosUsoService } from './casos-uso.service';
import { CreateCasoUsoDto } from './dto/create-caso-uso.dto';
import { UpdateCasoUsoDto } from './dto/update-caso-uso.dto';

/**
 * Rotas aninhadas: GET/POST /api/v1/planos-teste/:planoId/casos-uso
 * RBAC: Todos os perfis autenticados (Admin=CRUD, Gerente=CRU, Testador=CRU)
 * — sem @Roles() pois todo perfil tem acesso de leitura e escrita.
 */
@ApiTags('Casos de Uso')
@ApiBearerAuth()
@Controller('planos-teste')
export class CasosUsoNestedController {
  constructor(private service: CasosUsoService) {}

  @Get(':planoId/casos-uso')
  @ApiOperation({ summary: 'Listar casos de uso de um plano' })
  findByPlano(@Param('planoId') planoId: string) {
    return this.service.findByPlano(planoId);
  }

  @Post(':planoId/casos-uso')
  @ApiOperation({ summary: 'Criar caso de uso vinculado a um plano' })
  create(@Param('planoId') planoId: string, @Body() dto: CreateCasoUsoDto) {
    return this.service.create(planoId, dto);
  }
}

/**
 * Rota direta: PATCH /api/v1/casos-uso/:id
 */
@ApiTags('Casos de Uso')
@ApiBearerAuth()
@Controller('casos-uso')
export class CasosUsoController {
  constructor(private service: CasosUsoService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar caso de uso' })
  update(@Param('id') id: string, @Body() dto: UpdateCasoUsoDto) {
    return this.service.update(id, dto);
  }
}
