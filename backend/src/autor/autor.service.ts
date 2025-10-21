import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Autor, AutorPessoa, AutorInstituicao } from './entities/autor.entity';
import { AutorTipo } from './enums/autor-tipo.enum';
import { CreateAutorPessoaDto } from './dto/create-autor-pessoa.dto';
import { CreateAutorInstituicaoDto } from './dto/create-autor-instituicao.dto';
import { UpdateAutorDto } from './dto/update-autor.dto';

@Injectable()
export class AutorService {
  constructor(
    @InjectRepository(Autor)
    private readonly autorRepository: Repository<Autor>,
  ) {}

  async createPessoa(dto: CreateAutorPessoaDto): Promise<AutorPessoa> {
    const autorPessoa = this.autorRepository.create({
      ...dto,
      tipo_autor: AutorTipo.PESSOA,
    }) as AutorPessoa;
    return this.autorRepository.save(autorPessoa);
  }

  async createInstituicao(
    dto: CreateAutorInstituicaoDto,
  ): Promise<AutorInstituicao> {
    const autorInstituicao = this.autorRepository.create({
      ...dto,
      tipo_autor: AutorTipo.INSTITUICAO,
    }) as unknown as AutorInstituicao;
    return this.autorRepository.save(autorInstituicao);
  }

  async findAll(): Promise<Autor[]> {
    return this.autorRepository.find();
  }

  async findOne(id_autor: number): Promise<Autor> {
    const autor = await this.autorRepository.findOneBy({ id_autor });
    if (!autor) {
      throw new NotFoundException(`Autor com ID ${id_autor} não encontrado.`);
    }
    return autor;
  }

  async update(
    id_autor: number,
    updateAutorDto: UpdateAutorDto,
  ): Promise<Autor> {
    const autor = await this.findOne(id_autor);

    const autorAtualizado = this.autorRepository.merge(autor, updateAutorDto);

    return this.autorRepository.save(autorAtualizado);
  }

  async remove(id_autor: number): Promise<void> {
    const autor = await this.findOne(id_autor);
    await this.autorRepository.remove(autor);
  }
}