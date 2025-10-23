import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UsuarioService } from '../../usuario/usuario.service';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { UnauthorizedException } from '@nestjs/common';

// Mock ConfigService
const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'JWT_SECRET') return 'testSecret';
    return null;
  }),
};

// Mock UsuarioService
const mockUsuarioService = {
  findOne: jest.fn(),
};

// Mock Usuário
const mockUsuario = new Usuario();
mockUsuario.id_usuario = 1;
mockUsuario.email = 'teste@teste.com';
mockUsuario.senha = 'hashedPassword';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: UsuarioService, useValue: mockUsuarioService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('deve estar definido', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('deve retornar o usuário (sem senha) se encontrado', async () => {
      const payload = { sub: 1, email: 'teste@teste.com' };
      mockUsuarioService.findOne.mockResolvedValue(mockUsuario);

      const result = await strategy.validate(payload);

      expect(mockUsuarioService.findOne).toHaveBeenCalledWith(payload.sub);
      expect(result).toBeDefined();
      expect(result.id_usuario).toBe(payload.sub);
      expect(result.senha).toBeUndefined();
    });

    it('deve lançar UnauthorizedException se o usuário não for encontrado', async () => {
      const payload = { sub: 99, email: 'notfound@teste.com' };
      mockUsuarioService.findOne.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
      expect(mockUsuarioService.findOne).toHaveBeenCalledWith(payload.sub);
    });
  });
});