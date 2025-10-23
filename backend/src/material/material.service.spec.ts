import { Test, TestingModule } from '@nestjs/testing';
import { MaterialService } from './material.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { AutorService } from '../autor/autor.service';
import { Artigo, Livro, Material, Video } from './entities/material.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { AutorPessoa } from '../autor/entities/autor.entity';
import { MaterialTipo } from './enums/material-tipo.enum';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateLivroDto } from './dto/create-livro.dto';
import { of, throwError } from 'rxjs';
import { QueryMaterialDto } from './dto/query-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MaterialStatus } from './enums/material-status.enum';
import { CreateArtigoDto } from './dto/create-artigo.dto';
import { CreateVideoDto } from './dto/create-video.dto';


const mockMaterialRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  merge: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
};
const mockLivroRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOneBy: jest.fn(),
};
const mockArtigoRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOneBy: jest.fn(),
};

const mockAutorService = {
  findOne: jest.fn(),
};

const mockHttpService = {
  get: jest.fn(),
};

const mockUsuarioCriador = new Usuario();
mockUsuarioCriador.id_usuario = 1;
mockUsuarioCriador.email = 'criador@teste.com';

const mockOutroUsuario = new Usuario();
mockOutroUsuario.id_usuario = 2;
mockOutroUsuario.email = 'outro@teste.com';

const mockAutor = new AutorPessoa();
mockAutor.id_autor = 1;
mockAutor.nome = 'Autor Teste';

const mockLivro = new Livro();
mockLivro.id_material = 1;
mockLivro.titulo = 'Livro Teste';
mockLivro.tipo_material = MaterialTipo.LIVRO;
mockLivro.isbn = '1234567890123';
mockLivro.numero_paginas = 100;
mockLivro.usuario_criador = mockUsuarioCriador;
mockLivro.autor = mockAutor;


describe('MaterialService', () => {
  let service: MaterialService;
  let materialRepository: Repository<Material>;
  let livroRepository: Repository<Livro>;
  let artigoRepository: Repository<Artigo>;
  let autorService: AutorService;
  let httpService: HttpService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MaterialService,
        { provide: getRepositoryToken(Material), useValue: mockMaterialRepository },
        { provide: getRepositoryToken(Livro), useValue: mockLivroRepository },
        { provide: getRepositoryToken(Artigo), useValue: mockArtigoRepository },
        { provide: AutorService, useValue: mockAutorService },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<MaterialService>(MaterialService);
    materialRepository = module.get<Repository<Material>>(getRepositoryToken(Material));
    livroRepository = module.get<Repository<Livro>>(getRepositoryToken(Livro));
    artigoRepository = module.get<Repository<Artigo>>(getRepositoryToken(Artigo));
    autorService = module.get<AutorService>(AutorService);
    httpService = module.get<HttpService>(HttpService);

    mockMaterialRepository.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockLivro], 1]),
    });
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });


  describe('createLivro', () => {
     const baseDto: Omit<CreateLivroDto, 'titulo' | 'numero_paginas'> = {
        isbn: '9876543210987',
        id_autor: 1,
        status: MaterialStatus.RASCUNHO
     };


    it('deve criar um livro com sucesso (sem API externa, com dados completos)', async () => {
      const dtoCompleto: CreateLivroDto = { ...baseDto, titulo: 'Novo Livro Completo', numero_paginas: 200};
      const livroCompleto = { ...mockLivro, ...dtoCompleto };

      mockAutorService.findOne.mockResolvedValue(mockAutor);
      mockLivroRepository.findOneBy.mockResolvedValue(null);
      mockLivroRepository.create.mockReturnValue(livroCompleto);
      mockLivroRepository.save.mockResolvedValue(livroCompleto);

      const result = await service.createLivro(dtoCompleto, mockUsuarioCriador);

      expect(mockAutorService.findOne).toHaveBeenCalledWith(dtoCompleto.id_autor);
      expect(mockLivroRepository.findOneBy).toHaveBeenCalledWith({ isbn: dtoCompleto.isbn });
      expect(mockLivroRepository.create).toHaveBeenCalled();
      expect(mockLivroRepository.save).toHaveBeenCalled();
      expect(result).toEqual(livroCompleto);
      expect(mockHttpService.get).not.toHaveBeenCalled();
    });

    it('deve chamar a API externa se título ou páginas estiverem faltando e preencher', async () => {
      const dtoIncompleto: CreateLivroDto = { ...baseDto, titulo: undefined, numero_paginas: undefined };
      const livroApiPreenchido = {
        ...mockLivro,
        isbn: dtoIncompleto.isbn,
        id_autor: dtoIncompleto.id_autor,
        status: dtoIncompleto.status,
        titulo: 'Titulo da API',
        numero_paginas: 200,
      };

      mockAutorService.findOne.mockResolvedValue(mockAutor);
      mockLivroRepository.findOneBy.mockResolvedValue(null);

      mockLivroRepository.create.mockReturnValue({
          ...dtoIncompleto,
          tipo_material: MaterialTipo.LIVRO,
          usuario_criador: mockUsuarioCriador,
          autor: { id_autor: baseDto.id_autor },
      });
      mockLivroRepository.save.mockResolvedValue(livroApiPreenchido);

      const mockApiResponse = {
        data: {
          [`ISBN:${dtoIncompleto.isbn}`]: { title: 'Titulo da API', number_of_pages: 200 },
        },
      };
      mockHttpService.get.mockReturnValue(of(mockApiResponse));

      const result = await service.createLivro(dtoIncompleto, mockUsuarioCriador);

      expect(mockHttpService.get).toHaveBeenCalledWith(
        expect.stringContaining(dtoIncompleto.isbn),
      );

      expect(mockLivroRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ titulo: 'Titulo da API', numero_paginas: 200 }),
      );
      expect(result.titulo).toBe('Titulo da API');
      expect(result.numero_paginas).toBe(200);
    });

    it('deve lançar BadRequestException se API externa falhar E dados obrigatórios continuarem faltando', async () => {

      const dtoIncompleto: CreateLivroDto = {
        isbn: '1112223334445',
        id_autor: 1,
        status: MaterialStatus.RASCUNHO
      };

      const livroIncompleto = new Livro();
      livroIncompleto.isbn = dtoIncompleto.isbn;
      livroIncompleto.status = dtoIncompleto.status;
      livroIncompleto.tipo_material = MaterialTipo.LIVRO;
      livroIncompleto.usuario_criador = mockUsuarioCriador;
      livroIncompleto.autor = mockAutor;


      mockAutorService.findOne.mockResolvedValue(mockAutor);
      mockLivroRepository.findOneBy.mockResolvedValue(null);
      mockLivroRepository.create.mockReturnValue(livroIncompleto);


      const mockError = new Error('Falha na API Externa');
      mockHttpService.get.mockImplementation(() => throwError(() => mockError));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(service.createLivro(dtoIncompleto, mockUsuarioCriador))
          .rejects.toThrow(BadRequestException);

      expect(mockHttpService.get).toHaveBeenCalled();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Falha ao buscar dados da OpenLibrary:',
          mockError.message
      );

      expect(mockLivroRepository.save).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

     it('deve lançar BadRequestException se o autor não existir', async () => {
        mockAutorService.findOne.mockRejectedValue(new NotFoundException());
        const dtoCompleto: CreateLivroDto = { ...baseDto, titulo: 'Teste Autor Inexistente', numero_paginas: 100 };
        await expect(service.createLivro(dtoCompleto, mockUsuarioCriador)).rejects.toThrow(BadRequestException);
     });

     it('deve lançar ConflictException se o ISBN já existir', async () => {
        mockAutorService.findOne.mockResolvedValue(mockAutor);
        mockLivroRepository.findOneBy.mockResolvedValue(mockLivro);
        const dtoCompleto: CreateLivroDto = { ...baseDto, titulo: 'Teste ISBN Duplicado', numero_paginas: 100 };
        await expect(service.createLivro(dtoCompleto, mockUsuarioCriador)).rejects.toThrow(ConflictException);
     });

  });


  describe('createArtigo', () => {
    const dto: CreateArtigoDto = {
      titulo: 'Novo Artigo Científico',
      doi: '10.1234/unique-doi-5678',
      id_autor: 1,
      status: MaterialStatus.PUBLICADO,
      descricao: 'Resumo do artigo.',
    };

    const mockArtigo = new Artigo();
    mockArtigo.id_material = 2;
    mockArtigo.titulo = dto.titulo!;
    mockArtigo.doi = dto.doi!;
    mockArtigo.tipo_material = MaterialTipo.ARTIGO;
    mockArtigo.usuario_criador = mockUsuarioCriador;
    mockArtigo.autor = mockAutor;

    it('deve criar um artigo com sucesso', async () => {
      mockAutorService.findOne.mockResolvedValue(mockAutor);
      mockArtigoRepository.findOneBy.mockResolvedValue(null);
      mockArtigoRepository.create.mockReturnValue(mockArtigo);
      mockArtigoRepository.save.mockResolvedValue(mockArtigo);

      const result = await service.createArtigo(dto, mockUsuarioCriador);

      expect(mockAutorService.findOne).toHaveBeenCalledWith(dto.id_autor);
      expect(mockArtigoRepository.findOneBy).toHaveBeenCalledWith({ doi: dto.doi });
      expect(mockArtigoRepository.create).toHaveBeenCalled();
      expect(mockArtigoRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockArtigo);
    });

    it('deve lançar BadRequestException se o autor não existir', async () => {
      mockAutorService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.createArtigo(dto, mockUsuarioCriador)).rejects.toThrow(BadRequestException);
      expect(mockArtigoRepository.save).not.toHaveBeenCalled();
    });

    it('deve lançar ConflictException se o DOI já existir', async () => {
      mockAutorService.findOne.mockResolvedValue(mockAutor);
      mockArtigoRepository.findOneBy.mockResolvedValue(mockArtigo);

      await expect(service.createArtigo(dto, mockUsuarioCriador)).rejects.toThrow(ConflictException);
      expect(mockArtigoRepository.save).not.toHaveBeenCalled();
    });
  });


  describe('createVideo', () => {
    const dto: CreateVideoDto = {
      titulo: 'Video Tutorial NestJS',
      duracao_minutos: 15,
      id_autor: 1,
      status: MaterialStatus.PUBLICADO,
    };

    const mockVideo = new Video();
    mockVideo.id_material = 3;
    mockVideo.titulo = dto.titulo!;
    mockVideo.duracao_minutos = dto.duracao_minutos!;
    mockVideo.tipo_material = MaterialTipo.VIDEO;
    mockVideo.usuario_criador = mockUsuarioCriador;
    mockVideo.autor = mockAutor;

    it('deve criar um vídeo com sucesso', async () => {
      mockAutorService.findOne.mockResolvedValue(mockAutor);
      mockMaterialRepository.create.mockReturnValue(mockVideo);
      mockMaterialRepository.save.mockResolvedValue(mockVideo);

      const result = await service.createVideo(dto, mockUsuarioCriador);

      expect(mockAutorService.findOne).toHaveBeenCalledWith(dto.id_autor);
      expect(mockMaterialRepository.create).toHaveBeenCalled();
      expect(mockMaterialRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockVideo);
    });

    it('deve lançar BadRequestException se o autor não existir', async () => {
      mockAutorService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.createVideo(dto, mockUsuarioCriador)).rejects.toThrow(BadRequestException);
      expect(mockMaterialRepository.save).not.toHaveBeenCalled();
    });
  });



  describe('findAll', () => {
      it('deve retornar materiais paginados', async () => {
          const query: QueryMaterialDto = { pagina: 1, limite: 5 };
          const mockResult = [[mockLivro], 1];
          mockMaterialRepository.createQueryBuilder().getManyAndCount.mockResolvedValue(mockResult);

          const result = await service.findAll(query);

          expect(mockMaterialRepository.createQueryBuilder().skip).toHaveBeenCalledWith(0);
          expect(mockMaterialRepository.createQueryBuilder().take).toHaveBeenCalledWith(5);
          expect(result.dados).toEqual(mockResult[0]);
          expect(result.total).toBe(mockResult[1]);
      });

      it('deve aplicar o filtro de termo na busca', async () => {
          const query: QueryMaterialDto = { termo: 'Teste' };
          mockMaterialRepository.createQueryBuilder().getManyAndCount.mockResolvedValue([[mockLivro], 1]);

          await service.findAll(query);

          expect(mockMaterialRepository.createQueryBuilder().where).toHaveBeenCalledWith(
              expect.stringContaining('ILIKE :termo'),
              { termo: '%Teste%' }
          );
      });
  });

  describe('findOne', () => {
      it('deve retornar um material com relações', async () => {
          mockMaterialRepository.findOne.mockResolvedValue(mockLivro);

          const result = await service.findOne(1);

          expect(mockMaterialRepository.findOne).toHaveBeenCalledWith({
              where: { id_material: 1 },
              relations: ['autor', 'usuario_criador'],
          });
          expect(result).toEqual(mockLivro);
      });

      it('deve lançar NotFoundException se não encontrar', async () => {
          mockMaterialRepository.findOne.mockResolvedValue(null);
          await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
      });
  });


  describe('update', () => {
      const dto: UpdateMaterialDto = { titulo: 'Titulo Atualizado' };

      it('deve atualizar o material se o usuário for o criador', async () => {
          mockMaterialRepository.findOne.mockResolvedValue(mockLivro);
          mockMaterialRepository.merge.mockReturnValue({...mockLivro, ...dto});
          mockMaterialRepository.save.mockResolvedValue({...mockLivro, ...dto});

          const result = await service.update(1, dto, mockUsuarioCriador);
          expect(mockMaterialRepository.findOne).toHaveBeenCalledWith({ where: { id_material: 1 }, relations: ['autor', 'usuario_criador'] });
          expect(mockMaterialRepository.merge).toHaveBeenCalled();
          expect(mockMaterialRepository.save).toHaveBeenCalled();
          expect(result.titulo).toBe('Titulo Atualizado');
      });

      it('deve lançar ForbiddenException se o usuário NÃO for o criador', async () => {
          mockMaterialRepository.findOne.mockResolvedValue(mockLivro);

          await expect(service.update(1, dto, mockOutroUsuario)).rejects.toThrow(ForbiddenException);
          expect(mockMaterialRepository.save).not.toHaveBeenCalled();
      });

      it('deve lançar ConflictException se tentar atualizar para um ISBN existente', async () => {
         const dtoUpdate: UpdateMaterialDto = { isbn: 'isbn-existente-9' };
         const outroLivroComIsbn = new Livro();
         outroLivroComIsbn.id_material = 99;
         outroLivroComIsbn.isbn = 'isbn-existente-9';

         mockMaterialRepository.findOne.mockResolvedValue(mockLivro);
         mockLivroRepository.findOneBy.mockResolvedValue(outroLivroComIsbn);

         await expect(service.update(1, dtoUpdate, mockUsuarioCriador)).rejects.toThrow(ConflictException);
         expect(mockMaterialRepository.save).not.toHaveBeenCalled();
      });

  });

   describe('remove', () => {
       it('deve remover o material se o usuário for o criador', async () => {
           mockMaterialRepository.findOne.mockResolvedValue(mockLivro);
           mockMaterialRepository.remove.mockResolvedValue(undefined);

           await service.remove(1, mockUsuarioCriador);

           expect(mockMaterialRepository.findOne).toHaveBeenCalledWith({ where: { id_material: 1 }, relations: ['autor', 'usuario_criador'] });
           expect(mockMaterialRepository.remove).toHaveBeenCalledWith(mockLivro);
       });

       it('deve lançar ForbiddenException se o usuário NÃO for o criador', async () => {
           mockMaterialRepository.findOne.mockResolvedValue(mockLivro);

           await expect(service.remove(1, mockOutroUsuario)).rejects.toThrow(ForbiddenException);
           expect(mockMaterialRepository.remove).not.toHaveBeenCalled();
       });
   });
});