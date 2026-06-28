import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ResultadoExecucao } from '@stuv/shared';

export enum FormatoRelatorio {
  JSON = 'json',
  PDF = 'pdf',
  CSV = 'csv',
}

export enum PeriodoRelatorio {
  D7 = '7d',
  D30 = '30d',
  D90 = '90d',
  D180 = '180d',
  D365 = '365d',
}

export class QueryRelatorioDto {
  @IsOptional()
  @IsUUID()
  planoId?: string;

  @IsOptional()
  @IsEnum(PeriodoRelatorio)
  periodo?: PeriodoRelatorio;

  @IsOptional()
  @IsUUID()
  executorId?: string;

  @IsOptional()
  @IsEnum(ResultadoExecucao)
  status?: ResultadoExecucao;

  @IsOptional()
  @IsEnum(FormatoRelatorio)
  formato?: FormatoRelatorio;
}
