import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import * as path from 'path';
import { PerfilUsuario } from '@stuv/shared';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthUser } from '../auth/strategies/jwt.strategy';
import { CreateExecucaoDto } from './dto/create-execucao.dto';
import { UpdateExecucaoDto } from './dto/update-execucao.dto';
import { ExecucoesService } from './execucoes.service';

const { ADMINISTRADOR, GERENTE, TESTADOR } = PerfilUsuario;

/**
 * GET  /api/v1/casos-teste/:ctId/execucoes   — todos os autenticados (RD para Admin, CRU para Gerente/Testador)
 * POST /api/v1/casos-teste/:ctId/execucoes   — Gerente + Testador
 */
@ApiTags('Execuções')
@ApiBearerAuth()
@Controller('casos-teste')
export class ExecucoesNestedController {
  constructor(private service: ExecucoesService) {}

  @Get(':ctId/execucoes')
  @ApiOperation({ summary: 'Listar execuções de um caso de teste' })
  findByCt(@Param('ctId') ctId: string) {
    return this.service.findByCt(ctId);
  }

  @Post(':ctId/execucoes')
  @Roles(GERENTE, TESTADOR)
  @ApiOperation({ summary: 'Iniciar execução de um caso de teste' })
  create(
    @Param('ctId') ctId: string,
    @Body() dto: CreateExecucaoDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.create(ctId, dto, user.id);
  }
}

/**
 * PATCH  /api/v1/execucoes/:id           — Gerente + Testador
 * DELETE /api/v1/execucoes/:id           — Admin
 * POST   /api/v1/execucoes/:id/evidencias — Gerente + Testador
 */
@ApiTags('Execuções')
@ApiBearerAuth()
@Controller('execucoes')
export class ExecucoesController {
  constructor(private service: ExecucoesService) {}

  @Patch(':id')
  @Roles(GERENTE, TESTADOR)
  @ApiOperation({ summary: 'Registrar resultado de execução' })
  update(@Param('id') id: string, @Body() dto: UpdateExecucaoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(ADMINISTRADOR)
  @ApiOperation({ summary: 'Excluir execução (Admin)' })
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Post(':id/evidencias')
  @Roles(GERENTE, TESTADOR)
  @ApiOperation({ summary: 'Fazer upload de evidência para uma execução' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: path.join(__dirname, '..', '..', 'uploads'),
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname);
          const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
          cb(null, `${unique}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  )
  uploadEvidencia(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.createEvidencia(id, file);
  }
}
