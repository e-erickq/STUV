import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CasosTesteService } from './casos-teste.service';
import { CreateCasoTesteDto } from './dto/create-caso-teste.dto';
import { UpdateCasoTesteDto } from './dto/update-caso-teste.dto';

/**
 * GET /api/v1/casos-uso/:ucId/casos-teste
 * POST /api/v1/casos-uso/:ucId/casos-teste
 *
 * RBAC: Admin=CRUD, Gerente=CRU, Testador=CRU — todos têm acesso, sem @Roles().
 */
@ApiTags('Casos de Teste')
@ApiBearerAuth()
@Controller('casos-uso')
export class CasosTesteNestedController {
  constructor(private service: CasosTesteService) {}

  @Get(':ucId/casos-teste')
  @ApiOperation({ summary: 'Listar casos de teste de um caso de uso' })
  findByUc(@Param('ucId') ucId: string) {
    return this.service.findByUc(ucId);
  }

  @Post(':ucId/casos-teste')
  @ApiOperation({ summary: 'Criar caso de teste vinculado a um caso de uso' })
  create(@Param('ucId') ucId: string, @Body() dto: CreateCasoTesteDto) {
    return this.service.create(ucId, dto);
  }
}

/**
 * PATCH /api/v1/casos-teste/:id
 */
@ApiTags('Casos de Teste')
@ApiBearerAuth()
@Controller('casos-teste')
export class CasosTesteController {
  constructor(private service: CasosTesteService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar caso de teste' })
  update(@Param('id') id: string, @Body() dto: UpdateCasoTesteDto) {
    return this.service.update(id, dto);
  }
}
