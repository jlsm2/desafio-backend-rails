import {
  ObjectType,
  Field,
  ID,
  InterfaceType,
  Int,
} from '@nestjs/graphql';
import { AutorTipo } from '../enums/autor-tipo.enum';

@InterfaceType({
  resolveType(autor) {
    if (autor.tipo_autor === AutorTipo.PESSOA) {
      return AutorPessoaType;
    }
    if (autor.tipo_autor === AutorTipo.INSTITUICAO) {
      return AutorInstituicaoType;
    }
    return null;
  },
})
export abstract class AutorInterface {
  @Field(() => Int)
  id_autor: number;

  @Field(() => AutorTipo)
  tipo_autor: AutorTipo;

  @Field()
  nome: string;
}

@ObjectType({ implements: () => [AutorInterface] })
export class AutorPessoaType implements AutorInterface {
  id_autor: number;
  tipo_autor: AutorTipo;
  nome: string;

  @Field({ nullable: true })
  data_nascimento?: Date;
}

@ObjectType({ implements: () => [AutorInterface] })
export class AutorInstituicaoType implements AutorInterface {
  id_autor: number;
  tipo_autor: AutorTipo;
  nome: string;

  @Field({ nullable: true })
  cidade?: string;
}

import { registerEnumType } from '@nestjs/graphql';
registerEnumType(AutorTipo, {
  name: 'AutorTipo',
});