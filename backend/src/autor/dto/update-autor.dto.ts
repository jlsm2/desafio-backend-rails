import {
  IsString,
  IsOptional,
  Length,
  IsDateString,
  MaxDate,
} from 'class-validator';

export class UpdateAutorDto {
  @IsString()
  @Length(3, 120)
  @IsOptional()
  nome?: string;

  // Campo de Pessoa
  @IsDateString({}, { message: 'Data de nascimento deve ser uma data válida.' })
  @MaxDate(new Date(), { message: 'Data de nascimento não pode ser futura.' })
  @IsOptional()
  data_nascimento?: Date;

  // Campo de Instituição
  @IsString()
  @Length(2, 80, { message: 'Cidade deve ter entre 2 e 80 caracteres.' })
  @IsOptional()
  cidade?: string;
}