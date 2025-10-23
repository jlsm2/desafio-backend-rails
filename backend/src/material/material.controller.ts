import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common';
import { MaterialService } from './material.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { Usuario } from '../usuario/entities/usuario.entity';
import { CreateLivroDto } from './dto/create-livro.dto';
import { CreateArtigoDto } from './dto/create-artigo.dto';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { QueryMaterialDto } from './dto/query-material.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('material')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  private getUsuarioLogado(req: Request): Usuario {
    return req.user as Usuario;
  }

  @Post('livro')
  @HttpCode(HttpStatus.CREATED)
  createLivro(@Body() dto: CreateLivroDto, @Req() req: Request) {
    return this.materialService.createLivro(dto, this.getUsuarioLogado(req));
  }

  @Post('artigo')
  @HttpCode(HttpStatus.CREATED)
  createArtigo(@Body() dto: CreateArtigoDto, @Req() req: Request) {
    return this.materialService.createArtigo(dto, this.getUsuarioLogado(req));
  }

  @Post('video')
  @HttpCode(HttpStatus.CREATED)
  createVideo(@Body() dto: CreateVideoDto, @Req() req: Request) {
    return this.materialService.createVideo(dto, this.getUsuarioLogado(req));
  }

  @Get()
  findAll(@Query() query: QueryMaterialDto) {
    return this.materialService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.materialService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMaterialDto,
    @Req() req: Request,
  ) {
    return this.materialService.update(id, dto, this.getUsuarioLogado(req));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.materialService.remove(id, this.getUsuarioLogado(req));
  }
}