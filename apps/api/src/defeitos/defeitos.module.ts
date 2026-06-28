import { Module } from '@nestjs/common';
import { DefeitosController, DefeitosNestedController } from './defeitos.controller';
import { DefeitosService } from './defeitos.service';

@Module({
  controllers: [DefeitosNestedController, DefeitosController],
  providers: [DefeitosService],
})
export class DefeitosModule {}
