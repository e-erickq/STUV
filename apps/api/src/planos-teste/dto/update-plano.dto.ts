import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatusPlano } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdatePlanoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ enum: StatusPlano })
  @IsOptional()
  @IsEnum(StatusPlano)
  status?: StatusPlano;

  @ApiPropertyOptional({ minimum: 1, maximum: 7 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  etapaWizardAtual?: number;
}
