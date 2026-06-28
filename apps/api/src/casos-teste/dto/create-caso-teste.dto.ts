import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PrioridadeCasoTeste } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCasoTesteDto {
  @ApiProperty({ example: 'CT01 — Login com credenciais válidas' })
  @IsString()
  @MinLength(3)
  nome: string;

  @ApiPropertyOptional({ example: 'Usuário cadastrado no sistema com senha ativa' })
  @IsOptional()
  @IsString()
  preCondicoes?: string;

  @ApiProperty({ example: '1. Acessar /login\n2. Preencher e-mail e senha\n3. Clicar em Entrar' })
  @IsString()
  @MinLength(5)
  passos: string;

  @ApiProperty({ example: 'Sistema exibe dashboard do usuário' })
  @IsString()
  @MinLength(3)
  resultadoEsperado: string;

  @ApiPropertyOptional({ enum: PrioridadeCasoTeste, default: PrioridadeCasoTeste.MEDIA })
  @IsOptional()
  @IsEnum(PrioridadeCasoTeste)
  prioridade?: PrioridadeCasoTeste;
}
