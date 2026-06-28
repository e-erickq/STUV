import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ResultadoExecucao } from '@stuv/shared';

export class CreateExecucaoDto {
  @IsOptional()
  @IsEnum(ResultadoExecucao)
  resultado?: ResultadoExecucao;
}
