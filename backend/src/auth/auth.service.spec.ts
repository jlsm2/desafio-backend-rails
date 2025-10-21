import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsuarioService } from '../usuario/usuario.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Usuario } from '../usuario/entities/usuario.entity';
import { LoginDto } from './dto/login.dto';

// --- Mocks (Simulações) ---

// 1. Mock do UsuarioService
const mockUsuarioService = {
  create: jest.fn(),
  findOneByEmail: jest.fn(),
};

// 2. Mock do JwtService
const mockJwtService = {
  sign: jest.fn(),
};

// 3. Usuário Falso para testes
const mockUsuario = new Usuario();
mockUsuario.id_usuario = 1;
mockUsuario.email = 'teste@teste.com';
mockUsuario.senha = 'senha-hashed-123';
mockUsuario.validatePassword = jest.fn(); // Mock do método da entidade

// --- Fim dos Mocks ---

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    // Reseta os mocks antes de cada teste
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsuarioService,
          useValue: mockUsuarioService, // Usa a simulação
        },
        {
          provide: JwtService,
          useValue: mockJwtService, // Usa a simulação
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  // --- Testes de Registro (Register) ---

  describe('register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const dto: CreateUsuarioDto = {
        email: 'novo@teste.com',
        senha: 'senha123',
      };
      
      // Simula que o usuário foi criado e retorna o mock
      mockUsuarioService.create.mockResolvedValue(mockUsuario);

      const resultado = await service.register(dto);

      expect(mockUsuarioService.create).toHaveBeenCalledWith(dto);
      expect(resultado).toBeDefined();
      expect(resultado).not.toHaveProperty('senha'); // Verifica se a senha foi removida
    });

    it('deve lançar ConflictException se o e-mail já existir', async () => {
      const dto: CreateUsuarioDto = {
        email: 'existente@teste.com',
        senha: 'senha123',
      };

      // Simula que o UsuarioService lançou o erro de conflito
      mockUsuarioService.create.mockRejectedValue(new ConflictException());

      // Verifica se o AuthService repassa o erro
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