import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ResultadoExecucao } from '@stuv/shared';

export class UpdateExecucaoDto {
  @IsEnum(ResultadoExecucao)
  resultado: ResultadoExecucao;

  @ValidateIf((o) => o.resultado === ResultadoExecucao.FALHOU || o.resultado === ResultadoExecucao.BLOQUEADO)
  @IsString({ message: 'Motivo é obrigatório quando resultado é FALHOU ou BLOQUEADO.' })
  motivo?: string;
}
