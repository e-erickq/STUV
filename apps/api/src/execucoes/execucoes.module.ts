import { Module } from '@nestjs/common';
import { ExecucoesController, ExecucoesNestedController } from './execucoes.controller';
import { ExecucoesService } from './execucoes.service';

@Module({
  controllers: [ExecucoesNestedController, ExecucoesController],
  providers: [ExecucoesService],
})
export class ExecucoesModule {}
