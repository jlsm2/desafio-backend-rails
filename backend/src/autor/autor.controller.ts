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
} from '@nestjs/common';
import { AutorService } from './autor.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateAutorPessoaDto } from './dto/create-autor-pessoa.dto';
import { CreateAutorInstituicaoDto } from './dto/create-autor-instituicao.dto';
import { UpdateAutorDto } from './dto/update-autor.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('autor')
export class AutorController {
  constructor(private readonly autorService: AutorService) {}

  @Post('pessoa')
  @HttpCode(HttpStatus.CREATED)
  createPessoa(@Body() createAutorPessoaDto: CreateAutorPessoaDto) {
    return this.autorService.createPessoa(createAutorPessoaDto);
  }

  @Post('instituicao')
  @HttpCode(HttpStatus.CREATED)
  createInstituicao(
    @Body() createAutorInstituicaoDto: CreateAutorInstituicaoDto,
  ) {
    return this.autorService.createInstituicao(createAutorInstituicaoDto);
  }

  @Get()
  findAll() {
    return this.autorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.autorService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAutorDto: UpdateAutorDto,
  ) {
    return this.autorService.update(id, updateAutorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.autorService.remove(id);
  }
}