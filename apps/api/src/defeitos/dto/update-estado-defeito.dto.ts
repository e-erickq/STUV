import { IsEnum } from 'class-validator';
import { EstadoDefeito } from '@stuv/shared';

export class UpdateEstadoDefeitoDto {
  @IsEnum(EstadoDefeito)
  estado: EstadoDefeito;
}
