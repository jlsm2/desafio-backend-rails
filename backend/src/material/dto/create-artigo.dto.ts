import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { BaseMaterialDto } from './base-material.dto';

export class CreateArtigoDto extends BaseMaterialDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i, {
    message: 'DOI em formato inválido. Ex: 10.1000/xyz123',
  })
  doi: string;
}