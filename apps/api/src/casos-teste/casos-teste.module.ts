import { Module } from '@nestjs/common';
import { CasosTesteController, CasosTesteNestedController } from './casos-teste.controller';
import { CasosTesteService } from './casos-teste.service';

@Module({
  controllers: [CasosTesteNestedController, CasosTesteController],
  providers: [CasosTesteService],
})
export class CasosTesteModule {}
