import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsuarioService } from '../usuario/usuario.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Usuario } from '../usuario/entities/usuario.entity';
import { LoginDto } from './dto/login.dto';

// --- Mocks ---
const mockUsuarioService = {
  create: jest.fn(),
  findOneByEmail: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

const mockUsuario = new Usuario();
mockUsuario.id_usuario = 1;
mockUsuario.email = 'teste@teste.com';
mockUsuario.senha = 'senha-hashed-123';
mockUsuario.validatePassword = jest.fn();

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsuarioService,
          useValue: mockUsuarioService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  // --- Testes de Registro ---

  describe('register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const dto: CreateUsuarioDto = {
        email: 'novo@teste.com',
        senha: 'senha123',
      };
      
      mockUsuarioService.create.mockResolvedValue(mockUsuario);

      const resultado = await service.register(dto);

      expect(mockUsuarioService.create).toHaveBeenCalledWith(dto);
      expect(resultado).toBeDefined();
      expect(resultado).not.toHaveProperty('senha');
    });

    it('deve lançar ConflictException se o e-mail já existir', async () => {
      const dto: CreateUsuarioDto = {
        email: 'existente@teste.com',
        senha: 'senha123',
      };

      mockUsuarioService.create.mockRejectedValue(new ConflictException());

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  // --- Testes de Login ---

  describe('login', () => {
    const dto: LoginDto = { email: 'teste@teste.com', senha: 'senha123' };

    it('deve retornar um access_token no login com sucesso', async () => {
      // 1. Simula o usuário sendo encontrado
      mockUsuarioService.findOneByEmail.mockResolvedValue(mockUsuario);
      // 2. Simula a senha sendo válida
      (mockUsuario.validatePassword as jest.Mock).mockResolvedValue(true);
      // 3. Simula o token sendo assinado
      mockJwtService.sign.mockReturnValue('token-falso-123');

      const resultado = await service.login(dto);

      expect(mockUsuarioService.findOneByEmail).toHaveBeenCalledWith(dto.email);
      expect(mockUsuario.validatePassword).toHaveBeenCalledWith(dto.senha);
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(resultado).toEqual({ access_token: 'token-falso-123' });
    });

    it('deve lançar UnauthorizedException se o e-mail não existir', async () => {
      // Simula o usuário NÃO sendo encontrado
      mockUsuarioService.findOneByEmail.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException se a senha for inválida', async () => {
      // 1. Simula o usuário sendo encontrado
      mockUsuarioService.findOneByEmail.mockResolvedValue(mockUsuario);
      // 2. Simula a senha sendo INVÁLIDA
      (mockUsuario.validatePassword as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});