import { Module } from '@nestjs/common';
import { AutorService } from './autor.service';
import { AutorController } from './autor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  Autor,
  AutorPessoa,
  AutorInstituicao,
} from './entities/autor.entity';
import { AutorResolver } from './autor.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Autor, AutorPessoa, AutorInstituicao]),
  ],
  controllers: [AutorController],
  providers: [
    AutorService,
    AutorResolver,
  ],
  exports: [AutorService], 
})
export class AutorModule {}