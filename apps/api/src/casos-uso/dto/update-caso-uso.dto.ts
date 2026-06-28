import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCasoUsoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  atores?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fluxoPrincipal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fluxosAlternativos?: string;
}
