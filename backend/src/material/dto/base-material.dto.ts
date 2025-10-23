import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Length,
} from 'class-validator';
import { MaterialStatus } from '../enums/material-status.enum';

export class BaseMaterialDto {
  @IsString()
  @Length(3, 100)
  @IsOptional() 
  titulo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  descricao?: string;

  @IsEnum(MaterialStatus, {
    message: `Status deve ser um dos seguintes: ${Object.values(MaterialStatus).join(', ')}`,
  })
  @IsNotEmpty()
  status: MaterialStatus;

  @IsInt()
  @IsNotEmpty({ message: 'Todo material deve ter um autor.' })
  id_autor: number;
}