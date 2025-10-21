import { IsInt, Min, IsNotEmpty } from 'class-validator';
import { BaseMaterialDto } from './base-material.dto';

export class CreateVideoDto extends BaseMaterialDto {
  @IsInt()
  @Min(1, { message: 'Duração deve ser maior que zero.' })
  @IsNotEmpty()
  duracao_minutos: number;
}