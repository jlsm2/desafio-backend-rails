import {
  IsString,
  IsOptional,
  MaxLength,
  IsEnum,
  IsInt,
  Min,
  Length,
  Matches,
} from 'class-validator';
import { MaterialStatus } from '../enums/material-status.enum';


export class UpdateMaterialDto {
  @IsString()
  @Length(3, 100)
  @IsOptional()
  titulo?: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  descricao?: string;

  @IsEnum(MaterialStatus)
  @IsOptional()
  status?: MaterialStatus;

  @IsInt()
  @IsOptional()
  id_autor?: number;

  // Campos de Livro
  @IsString()
  @Length(13, 13, { message: 'ISBN deve ter exatamente 13 caracteres.' })
  @IsOptional()
  isbn?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  numero_paginas?: number;

  // Campos de Artigo
  @IsString()
  @Matches(/^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i, {
    message: 'DOI em formato inválido.',
  })
  @IsOptional()
  doi?: string;

  // Campos de Video
  @IsInt()
  @Min(1)
  @IsOptional()
  duracao_minutos?: number;
}