import {
  IsString,
  IsNotEmpty,
  Length,
  IsDateString,
  MaxDate,
} from 'class-validator';

export class CreateAutorPessoaDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 80, {
    message: 'Nome de pessoa deve ter entre 3 e 80 caracteres.',
  })
  nome: string;

  @IsDateString({}, { message: 'Data de nascimento deve ser uma data válida.' })
  @MaxDate(new Date(), { message: 'Data de nascimento não pode ser futura.' })
  @IsNotEmpty()
  data_nascimento: Date;
}