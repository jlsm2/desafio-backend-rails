import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from '../usuario/usuario.service';

// Mock do AuthService
const mockAuthService = {
  register: jest.fn().mockResolvedValue({ id_usuario: 1, email: 'test@test.com' }),
  login: jest.fn().mockResolvedValue({ access_token: 'fakeToken' }),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsuarioService, useValue: {} },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('deve chamar authService.register com o DTO correto', async () => {
      const dto = new CreateUsuarioDto();
      dto.email = 'register@test.com';
      dto.senha = 'password';
      await controller.register(dto);
      expect(service.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('deve chamar authService.login com o DTO correto', async () => {
      const dto = new LoginDto();
      dto.email = 'login@test.com';
      dto.senha = 'password';
      await controller.login(dto);
      expect(service.login).toHaveBeenCalledWith(dto);
    });
  });
});