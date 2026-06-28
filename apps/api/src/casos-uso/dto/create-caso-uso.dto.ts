import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCasoUsoDto {
  @ApiProperty({ example: 'UC01 — Login de Usuário' })
  @IsString()
  @MinLength(3)
  nome: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ example: 'Usuário cadastrado, sistema disponível' })
  @IsOptional()
  @IsString()
  atores?: string;

  @ApiPropertyOptional({ description: 'Pode ser vazio em rascunhos' })
  @IsOptional()
  @IsString()
  fluxoPrincipal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fluxosAlternativos?: string;
}
