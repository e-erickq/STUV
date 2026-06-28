import { ApiPropertyOptional } from '@nestjs/swagger';
import { PrioridadeCasoTeste } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateCasoTesteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preCondicoes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  passos?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  resultadoEsperado?: string;

  @ApiPropertyOptional({ enum: PrioridadeCasoTeste })
  @IsOptional()
  @IsEnum(PrioridadeCasoTeste)
  prioridade?: PrioridadeCasoTeste;
}
