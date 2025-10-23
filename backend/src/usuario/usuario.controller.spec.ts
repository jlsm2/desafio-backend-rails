// backend/src/usuario/usuario.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { AuthGuard } from '@nestjs/passport';
import { Usuario } from './entities/usuario.entity';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

// Mock do UsuarioService
const mockUsuarioService = {
  findAll: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue({ id_usuario: 1, email: 'teste@teste.com' }),
  update: jest.fn(),
  remove: jest.fn(),
};

// Mock do Request com usuário
const mockRequest = {
  user: { id_usuario: 1, email: 'teste@teste.com' } as Usuario,
};

describe('UsuarioController', () => {
  let controller: UsuarioController;
  let service: UsuarioService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [
        { provide: UsuarioService, useValue: mockUsuarioService },
      ],
    })
    .overrideGuard(AuthGuard('jwt'))
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<UsuarioController>(UsuarioController);
    service = module.get<UsuarioService>(UsuarioService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('findAll deve chamar service.findAll', async () => {
    await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
  });

  it('findMe deve chamar service.findOne com ID do usuário logado', async () => {
    await controller.findMe(mockRequest as any);
    expect(service.findOne).toHaveBeenCalledWith(mockRequest.user.id_usuario);
  });

  it('findOne deve chamar service.findOne com ID do parâmetro', async () => {
    await controller.findOne(2);
    expect(service.findOne).toHaveBeenCalledWith(2);
  });

  it('update deve chamar service.update com ID, DTO e usuário logado', async () => {
    const dto = new UpdateUsuarioDto();
    await controller.update(1, dto, mockRequest as any);
    expect(service.update).toHaveBeenCalledWith(1, dto, mockRequest.user);
  });

  it('remove deve chamar service.remove com ID e usuário logado', async () => {
    await controller.remove(1, mockRequest as any);
    expect(service.remove).toHaveBeenCalledWith(1, mockRequest.user);
  });
});