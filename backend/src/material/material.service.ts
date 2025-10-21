import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AutorService } from '../autor/autor.service';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Artigo, Livro, Material, Video } from './entities/material.entity';
import { MaterialTipo } from './enums/material-tipo.enum';
import { CreateLivroDto } from './dto/create-livro.dto';
import { CreateArtigoDto } from './dto/create-artigo.dto';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { QueryMaterialDto } from './dto/query-material.dto';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
    @InjectRepository(Livro)
    private readonly livroRepository: Repository<Livro>,
    @InjectRepository(Artigo)
    private readonly artigoRepository: Repository<Artigo>,

    private readonly autorService: AutorService,
    private readonly httpService: HttpService,
  ) {}

  // --- MÉTODOS DE CRIAÇÃO ---

  async createLivro(
    dto: CreateLivroDto,
    usuario: Usuario,
  ): Promise<Livro> {
    await this.validarCriacao(dto.id_autor, { isbn: dto.isbn });

    const livro = this.livroRepository.create({
      ...dto,
      tipo_material: MaterialTipo.LIVRO,
      usuario_criador: usuario,
      autor: { id_autor: dto.id_autor },
    });

    // API Externa
    if (!dto.titulo || !dto.numero_paginas) {
      try {
        const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${dto.isbn}&format=json&jscmd=data`;
        const response = await firstValueFrom(this.httpService.get(url));
        const data = response.data[`ISBN:${dto.isbn}`];

        if (data) {
          if (!dto.titulo) livro.titulo = data.title;
          if (!dto.numero_paginas)
            livro.numero_paginas = data.number_of_pages;
        }
      } catch (error) {
        console.error('Falha ao buscar dados da OpenLibrary:', error.message);
      }
    }

    return this.livroRepository.save(livro);
  }

  async createArtigo(
    dto: CreateArtigoDto,
    usuario: Usuario,
  ): Promise<Artigo> {
    await this.validarCriacao(dto.id_autor, { doi: dto.doi });

    const artigo = this.artigoRepository.create({
      ...dto,
      tipo_material: MaterialTipo.ARTIGO,
      usuario_criador: usuario,
      autor: { id_autor: dto.id_autor },
    });
    return this.artigoRepository.save(artigo);
  }

  async createVideo(dto: CreateVideoDto, usuario: Usuario): Promise<Video> {
    await this.validarCriacao(dto.id_autor);

    const video = this.materialRepository.create({
      ...dto,
      tipo_material: MaterialTipo.VIDEO,
      usuario_criador: usuario,
      autor: { id_autor: dto.id_autor },
    }) as Video;
    return this.materialRepository.save(video);
  }

  // --- MÉTODOS DE LEITURA (CRUD) ---

  async findAll(query: QueryMaterialDto) {
    const { pagina = 1, limite = 10, termo } = query;
    const skip = (pagina - 1) * limite;

    const qb = this.materialRepository
      .createQueryBuilder('material')
      .leftJoinAndSelect('material.autor', 'autor')
      .orderBy('material.titulo', 'ASC')
      .skip(skip)
      .take(limite);

    if (termo) {
      qb.where(
        'material.titulo ILIKE :termo OR material.descricao ILIKE :termo OR autor.nome ILIKE :termo',
        { termo: `%${termo}%` },
      );
    }

    const [resultados, total] = await qb.getManyAndCount();
    return {
      dados: resultados,
      total,
      pagina,
      limite,
    };
  }

  async findOne(id_material: number): Promise<Material> {
    const material = await this.materialRepository.findOne({
      where: { id_material },
      relations: ['autor', 'usuario_criador'],
    });
    if (!material) {
      throw new NotFoundException(`Material com ID ${id_material} não encontrado.`);
    }
    return material;
  }


  async update(
    id_material: number,
    dto: UpdateMaterialDto,
    usuario: Usuario,
  ): Promise<Material> {
    const material = await this.findOne(id_material);
    this.validarPermissao(material, usuario);

    if (dto.isbn && dto.isbn !== (material as Livro).isbn) {
      await this.checarDuplicidade({ isbn: dto.isbn });
    }
    if (dto.doi && dto.doi !== (material as Artigo).doi) {
      await this.checarDuplicidade({ doi: dto.doi });
    }

    const materialAtualizado = this.materialRepository.merge(material, dto);
    return this.materialRepository.save(materialAtualizado);
  }

  async remove(id_material: number, usuario: Usuario): Promise<void> {
    const material = await this.findOne(id_material);
    this.validarPermissao(material, usuario);

    await this.materialRepository.remove(material);
  }

  private async validarCriacao(
    id_autor: number,
    unicos: { isbn?: string; doi?: string } = {},
  ) {
    try {
      await this.autorService.findOne(id_autor);
    } catch (error) {
      throw new BadRequestException(`Autor com ID ${id_autor} não existe.`);
    }

    await this.checarDuplicidade(unicos);
  }

  private async checarDuplicidade(unicos: { isbn?: string; doi?: string }) {
    if (unicos.isbn) {
      const existe = await this.livroRepository.findOneBy({ isbn: unicos.isbn });
      if (existe) {
        throw new ConflictException(`ISBN ${unicos.isbn} já está cadastrado.`);
      }
    }
    if (unicos.doi) {
      const existe = await this.artigoRepository.findOneBy({ doi: unicos.doi });
      if (existe) {
        throw new ConflictException(`DOI ${unicos.doi} já está cadastrado.`);
      }
    }
  }

  private validarPermissao(material: Material, usuario: Usuario) {
    if (material.usuario_criador.id_usuario !== usuario.id_usuario) {
      throw new ForbiddenException(
        'Você não tem permissão para modificar este material.',
      );
    }
  }
}