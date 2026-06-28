import { IsEnum, IsString, MinLength } from 'class-validator';
import { GravidadeDefeito } from '@stuv/shared';

export class CreateDefeitoDto {
  @IsString()
  @MinLength(5)
  titulo: string;

  @IsString()
  @MinLength(10)
  descricao: string;

  @IsEnum(GravidadeDefeito)
  gravidade: GravidadeDefeito;

  @IsString()
  @MinLength(10)
  passosReproducao: string;
}
