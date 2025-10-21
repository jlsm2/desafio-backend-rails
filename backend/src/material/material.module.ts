import { Module } from '@nestjs/common';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material, Livro, Artigo, Video } from './entities/material.entity';
import { HttpModule } from '@nestjs/axios';
import { AutorModule } from '../autor/autor.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Material, Livro, Artigo, Video]),
    HttpModule,
    AutorModule,
  ],
  controllers: [MaterialController],
  providers: [MaterialService],
})
export class MaterialModule {}