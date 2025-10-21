import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateAutorInstituicaoDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 120, {
    message: 'Nome de instituição deve ter entre 3 e 120 caracteres.',
  })
  nome: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 80, { message: 'Cidade deve ter entre 2 e 80 caracteres.' })
  cidade: string;
}