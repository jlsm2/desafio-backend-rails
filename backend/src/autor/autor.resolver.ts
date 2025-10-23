import { Resolver, Query } from '@nestjs/graphql';
import { AutorService } from './autor.service';
import { AutorInterface } from './graphql/autor.types';
import { Autor } from './entities/autor.entity';

@Resolver(() => AutorInterface)
export class AutorResolver {
  constructor(private readonly autorService: AutorService) {}

  @Query(() => [AutorInterface], { name: 'autores' })
  async getAutores(): Promise<Autor[]> {
    return this.autorService.findAll();
  }
}