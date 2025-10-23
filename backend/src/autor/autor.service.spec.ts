import { Test, TestingModule } from '@nestjs/testing';
import { AutorService } from './autor.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Autor, AutorPessoa, AutorInstituicao } from './entities/autor.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { AutorTipo } from './enums/autor-tipo.enum';
import { CreateAutorPessoaDto } from './dto/create-autor-pessoa.dto';
import { CreateAutorInstituicaoDto } from './dto/create-autor-instituicao.dto';
import { UpdateAutorDto } from './dto/update-autor.dto';

const mockAutorRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  merge: jest.fn(),
  remove: jest.fn(),
};

// --- Mocks de Entidades ---
const mockAutorPessoa = new AutorPessoa();
mockAutorPessoa.id_autor = 1;
mockAutorPessoa.nome = 'Autor Pessoa Teste';
mockAutorPessoa.tipo_autor = AutorTipo.PESSOA;
mockAutorPessoa.data_nascimento = new Date('1990-01-01');

const mockAutorInstituicao = new AutorInstituicao();
mockAutorInstituicao.id_autor = 2;
mockAutorInstituicao.nome = 'Instituicao Teste';
mockAutorInstituicao.tipo_autor = AutorTipo.INSTITUICAO;
mockAutorInstituicao.cidade = 'Recife';


describe('AutorService', () => {
  let service: AutorService;
  let repository: Repository<Autor>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutorService,
        {
          provide: getRepositoryToken(Autor),
          useValue: mockAutorRepository,
        },
      ],
    }).compile();

    service = module.get<AutorService>(AutorService);
    repository = module.get<Repository<Autor>>(getRepositoryToken(Autor)); // Pega a instância do mock
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  // --- Testes de Criação ---

  describe('createPessoa', () => {
    it('deve criar e retornar um Autor Pessoa', async () => {
      const dto: CreateAutorPessoaDto = {
        nome: 'Nova Pessoa',
        data_nascimento: new Date('1995-05-15'),
      };
      mockAutorRepository.create.mockReturnValue({
        ...dto,
        tipo_autor: AutorTipo.PESSOA,
      });
      mockAutorRepository.save.mockResolvedValue(mockAutorPessoa);

      const resultado = await service.createPessoa(dto);

      expect(mockAutorRepository.create).toHaveBeenCalledWith({
        ...dto,
        tipo_autor: AutorTipo.PESSOA,
      });
      expect(mockAutorRepository.save).toHaveBeenCalled();
      expect(resultado).toEqual(mockAutorPessoa);
    });
  });

  describe('createInstituicao', () => {
    it('deve criar e retornar um Autor Instituicao', async () => {
      const dto: CreateAutorInstituicaoDto = {
        nome: 'Nova Instituicao',
        cidade: 'Olinda',
      };
      mockAutorRepository.create.mockReturnValue({
        ...dto,
        tipo_autor: AutorTipo.INSTITUICAO,
      });
      mockAutorRepository.save.mockResolvedValue(mockAutorInstituicao);

      const resultado = await service.createInstituicao(dto);

      expect(mockAutorRepository.create).toHaveBeenCalledWith({
        ...dto,
        tipo_autor: AutorTipo.INSTITUICAO,
      });
      expect(mockAutorRepository.save).toHaveBeenCalled();
      expect(resultado).toEqual(mockAutorInstituicao);
    });
  });

  // --- Testes de Leitura ---

  describe('findAll', () => {
    it('deve retornar uma lista de autores', async () => {
      const autores = [mockAutorPessoa, mockAutorInstituicao];
      mockAutorRepository.find.mockResolvedValue(autores);

      const resultado = await service.findAll();

      expect(mockAutorRepository.find).toHaveBeenCalled();
      expect(resultado).toEqual(autores);
    });
  });

  describe('findOne', () => {
    it('deve retornar um autor pelo ID', async () => {
      mockAutorRepository.findOneBy.mockResolvedValue(mockAutorPessoa);

      const resultado = await service.findOne(1);

      expect(mockAutorRepository.findOneBy).toHaveBeenCalledWith({ id_autor: 1 });
      expect(resultado).toEqual(mockAutorPessoa);
    });

    it('deve lançar NotFoundException se o autor não for encontrado', async () => {
      mockAutorRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  // --- Testes de Atualização ---

  describe('update', () => {
    it('deve atualizar e retornar o autor', async () => {
      const dto: UpdateAutorDto = { nome: 'Nome Atualizado' };
      const autorAntigo = mockAutorPessoa;
      const autorAtualizadoEsperado = { ...autorAntigo, ...dto };

      mockAutorRepository.findOneBy.mockResolvedValue(autorAntigo);
      mockAutorRepository.merge.mockReturnValue(autorAtualizadoEsperado);
      mockAutorRepository.save.mockResolvedValue(autorAtualizadoEsperado);

      const resultado = await service.update(1, dto);

      expect(mockAutorRepository.findOneBy).toHaveBeenCalledWith({ id_autor: 1 });
      expect(mockAutorRepository.merge).toHaveBeenCalledWith(autorAntigo, dto);
      expect(mockAutorRepository.save).toHaveBeenCalledWith(autorAtualizadoEsperado);
      expect(resultado).toEqual(autorAtualizadoEsperado);
    });

    it('deve lançar NotFoundException se o autor a ser atualizado não existir', async () => {
      const dto: UpdateAutorDto = { nome: 'Nome Atualizado' };
      mockAutorRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(99, dto)).rejects.toThrow(NotFoundException);
    });
  });

  // --- Testes de Remoção ---

  describe('remove', () => {
    it('deve remover o autor com sucesso', async () => {
      mockAutorRepository.findOneBy.mockResolvedValue(mockAutorPessoa);
      mockAutorRepository.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockAutorRepository.findOneBy).toHaveBeenCalledWith({ id_autor: 1 });
      expect(mockAutorRepository.remove).toHaveBeenCalledWith(mockAutorPessoa);
    });

    it('deve lançar NotFoundException se o autor a ser removido não existir', async () => {
      mockAutorRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});