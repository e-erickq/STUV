import { ApiProperty } from '@nestjs/swagger';
import { PerfilUsuario } from '@prisma/client';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  nome: string;

  @ApiProperty({ example: 'joao@stuv.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123', minLength: 6 })
  @IsString()
  @MinLength(6)
  senha: string;

  @ApiProperty({ enum: PerfilUsuario })
  @IsEnum(PerfilUsuario)
  perfil: PerfilUsuario;
}
