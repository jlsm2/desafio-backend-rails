import { Test, TestingModule } from '@nestjs/testing';
import { AutorController } from './autor.controller';
import { AutorService } from './autor.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateAutorPessoaDto } from './dto/create-autor-pessoa.dto';
import { CreateAutorInstituicaoDto } from './dto/create-autor-instituicao.dto';
import { UpdateAutorDto } from './dto/update-autor.dto';

// Mock do AutorService
const mockAutorService = {
  createPessoa: jest.fn().mockResolvedValue({ id_autor: 1, nome: 'Mock Pessoa', tipo_autor: 'PESSOA' }),
  createInstituicao: jest.fn().mockResolvedValue({ id_autor: 2, nome: 'Mock Instituicao', tipo_autor: 'INSTITUICAO' }),
  findAll: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue({ id_autor: 1, nome: 'Mock Autor' }),
  update: jest.fn().mockImplementation((id, dto) => Promise.resolve({ id_autor: id, ...dto })),
  remove: jest.fn().mockResolvedValue(undefined),
};

describe('AutorController', () => {
  let controller: AutorController;
  let service: AutorService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AutorController],
      providers: [
        { provide: AutorService, useValue: mockAutorService },
      ],
    })
    // Mocka o AuthGuard para sempre passar
    .overrideGuard(AuthGuard('jwt'))
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<AutorController>(AutorController);
    service = module.get<AutorService>(AutorService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('createPessoa deve chamar service.createPessoa', async () => {
    const dto = new CreateAutorPessoaDto();
    await controller.createPessoa(dto);
    expect(service.createPessoa).toHaveBeenCalledWith(dto);
  });

  it('createInstituicao deve chamar service.createInstituicao', async () => {
    const dto = new CreateAutorInstituicaoDto();
    await controller.createInstituicao(dto);
    expect(service.createInstituicao).toHaveBeenCalledWith(dto);
  });

  it('findAll deve chamar service.findAll', async () => {
    await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
  });

  it('findOne deve chamar service.findOne com ID', async () => {
    await controller.findOne(1);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('update deve chamar service.update com ID e DTO', async () => {
    const dto = new UpdateAutorDto();
    await controller.update(1, dto);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('remove deve chamar service.remove com ID', async () => {
    await controller.remove(1);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});