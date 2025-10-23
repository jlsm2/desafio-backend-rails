import {
  IsNotEmpty,
  IsString,
  Length,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';
import { BaseMaterialDto } from './base-material.dto';

export class CreateLivroDto extends BaseMaterialDto {
  @IsString()
  @Length(13, 13, { message: 'ISBN deve ter exatamente 13 caracteres numéricos.' })
  @IsNotEmpty()
  isbn: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  numero_paginas?: number;
}