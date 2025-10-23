// backend/src/material/material.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { MaterialController } from './material.controller';
import { MaterialService } from './material.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateLivroDto } from './dto/create-livro.dto';
import { QueryMaterialDto } from './dto/query-material.dto';
import { Usuario } from '../usuario/entities/usuario.entity';
import { CreateArtigoDto } from './dto/create-artigo.dto';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';

// Mock do MaterialService
const mockMaterialService = {
  createLivro: jest.fn().mockResolvedValue({ id_material: 1, titulo: 'Livro Mock' }),
  createArtigo: jest.fn().mockResolvedValue({ id_material: 2, titulo: 'Artigo Mock' }),
  createVideo: jest.fn().mockResolvedValue({ id_material: 3, titulo: 'Video Mock' }),
  findAll: jest.fn().mockResolvedValue({ dados: [], total: 0 }),
  findOne: jest.fn().mockResolvedValue({ id_material: 1 }),
  update: jest.fn(),
  remove: jest.fn(),
};

// Mock do objeto Request com o usuário
const mockRequest = {
  user: { id_usuario: 1, email: 'teste@teste.com' } as Usuario,
};

describe('MaterialController', () => {
  let controller: MaterialController;
  let service: MaterialService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialController],
      providers: [
        { provide: MaterialService, useValue: mockMaterialService },
      ],
    })
    .overrideGuard(AuthGuard('jwt'))
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<MaterialController>(MaterialController);
    service = module.get<MaterialService>(MaterialService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('createLivro deve chamar service.createLivro com DTO e usuário', async () => {
    const dto = new CreateLivroDto();
    await controller.createLivro(dto, mockRequest as any);
    expect(service.createLivro).toHaveBeenCalledWith(dto, mockRequest.user);
  });

  it('createArtigo deve chamar service.createArtigo com DTO e usuário', async () => {
    const dto = new CreateArtigoDto();
    await controller.createArtigo(dto, mockRequest as any);
    expect(service.createArtigo).toHaveBeenCalledWith(dto, mockRequest.user);
  });

  it('createVideo deve chamar service.createVideo com DTO e usuário', async () => {
    const dto = new CreateVideoDto();
    await controller.createVideo(dto, mockRequest as any);
    expect(service.createVideo).toHaveBeenCalledWith(dto, mockRequest.user);
  });

  it('findAll deve chamar service.findAll com query', async () => {
    const query = new QueryMaterialDto();
    await controller.findAll(query);
    expect(service.findAll).toHaveBeenCalledWith(query);
  });

  it('findOne deve chamar service.findOne com ID', async () => {
    await controller.findOne(1);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('update deve chamar service.update com ID, DTO e usuário', async () => {
    const dto = new UpdateMaterialDto();
    await controller.update(1, dto, mockRequest as any);
    expect(service.update).toHaveBeenCalledWith(1, dto, mockRequest.user);
  });

  it('remove deve chamar service.remove com ID e usuário', async () => {
    await controller.remove(1, mockRequest as any);
    expect(service.remove).toHaveBeenCalledWith(1, mockRequest.user);
  });
});