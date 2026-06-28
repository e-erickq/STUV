import { Module } from '@nestjs/common';
import { CasosUsoController, CasosUsoNestedController } from './casos-uso.controller';
import { CasosUsoService } from './casos-uso.service';

@Module({
  controllers: [CasosUsoNestedController, CasosUsoController],
  providers: [CasosUsoService],
})
export class CasosUsoModule {}
