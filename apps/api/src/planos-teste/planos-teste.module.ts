import { Module } from '@nestjs/common';
import { PlanoTesteController } from './planos-teste.controller';
import { PlanoTesteService } from './planos-teste.service';

@Module({
  controllers: [PlanoTesteController],
  providers: [PlanoTesteService],
})
export class PlanosTesteModule {}
