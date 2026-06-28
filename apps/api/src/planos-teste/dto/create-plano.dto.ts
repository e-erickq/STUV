import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreatePlanoDto {
  @ApiProperty({ example: 'Plano de Testes — Módulo de Pagamentos' })
  @IsString()
  @MinLength(3)
  nome: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  etapaWizardAtual?: number;
}
