// backend/src/usuario/usuario.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioService } from './usuario.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

// Mock bcrypt hash function
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn(),
}));

// Mock do TypeORM Repository
const mockUsuarioRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOneBy: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Mock de Usuário
const mockUsuario = new Usuario();
mockUsuario.id_usuario = 1;
mockUsuario.email = 'teste@teste.com';
mockUsuario.senha = 'hashedPassword';

const mockUsuarioLogado = new Usuario();
mockUsuarioLogado.id_usuario = 1;
mockUsuarioLogado.email = 'teste@teste.com';


describe('UsuarioService', () => {
  let service: UsuarioService;
  let repository: Repository<Usuario>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuarioRepository,
        },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
    repository = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto: CreateUsuarioDto = { email: 'novo@teste.com', senha: 'senha123' };

    it('deve criar um usuário e retornar sem a senha', async () => {
      mockUsuarioRepository.findOneBy.mockResolvedValue(null);
      mockUsuarioRepository.create.mockReturnValue({ ...dto });
      mockUsuarioRepository.save.mockResolvedValue({ ...mockUsuario, email: dto.email });

      const result = await service.create(dto);

      expect(mockUsuarioRepository.findOneBy).toHaveBeenCalledWith({ email: dto.email });
      expect(mockUsuarioRepository.create).toHaveBeenCalledWith(dto);
      expect(mockUsuarioRepository.save).toHaveBeenCalled();
      expect(result.senha).toBeUndefined();
      expect(result.email).toBe(dto.email);
    });

    it('deve lançar ConflictException se o e-mail já existir', async () => {
      mockUsuarioRepository.findOneBy.mockResolvedValue(mockUsuario);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockUsuarioRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findOneByEmail', () => {
    it('deve encontrar e retornar um usuário pelo e-mail (com senha)', async () => {
      mockUsuarioRepository.findOneBy.mockResolvedValue(mockUsuario);
      const result = await service.findOneByEmail('teste@teste.com');
      expect(mockUsuarioRepository.findOneBy).toHaveBeenCalledWith({ email: 'teste@teste.com' });
      expect(result).toEqual(mockUsuario);
      expect(result!.senha).toBeDefined();
    });
  });

  describe('findOne', () => {
     it('deve encontrar e retornar um usuário pelo ID (sem senha)', async () => {
       mockUsuarioRepository.findOneBy.mockResolvedValue(mockUsuario);
       const result = await service.findOne(1);
       expect(mockUsuarioRepository.findOneBy).toHaveBeenCalledWith({ id_usuario: 1 });
       expect(result).toBeDefined();
       expect(result.senha).toBeUndefined();
     });

     it('deve lançar NotFoundException se não encontrar', async () => {
        mockUsuarioRepository.findOneBy.mockResolvedValue(null);
        await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
     });
  });

  describe('update', () => {
    const dto: UpdateUsuarioDto = { email: 'atualizado@teste.com' };

    it('deve atualizar o usuário se for o dono e retornar sem senha', async () => {
      mockUsuarioRepository.findOneBy.mockResolvedValue(mockUsuario);
      mockUsuarioRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(1, dto, mockUsuarioLogado);

      expect(mockUsuarioRepository.update).toHaveBeenCalledWith(1, dto);
      expect(mockUsuarioRepository.findOneBy).toHaveBeenCalledWith({ id_usuario: 1 });
      expect(result.senha).toBeUndefined();
    });

    it('deve hashear a senha se ela for fornecida no update', async () => {
       const dtoComSenha: UpdateUsuarioDto = { senha: 'novaSenha123' };
       mockUsuarioRepository.findOneBy.mockResolvedValue(mockUsuario); 
       mockUsuarioRepository.update.mockResolvedValue({ affected: 1 });

       await service.update(1, dtoComSenha, mockUsuarioLogado);

       expect(bcrypt.hash).toHaveBeenCalledWith('novaSenha123', 10);
       expect(mockUsuarioRepository.update).toHaveBeenCalledWith(1, { senha: 'hashedPassword' });
    });

    it('deve lançar ForbiddenException se tentar atualizar outro usuário', async () => {
      const outroUsuario = new Usuario();
      outroUsuario.id_usuario = 2;
      await expect(service.update(2, dto, mockUsuarioLogado)).rejects.toThrow(ForbiddenException);
      expect(mockUsuarioRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
     it('deve remover o usuário se for o dono', async () => {
       mockUsuarioRepository.findOneBy.mockResolvedValue(mockUsuario);
       mockUsuarioRepository.remove.mockResolvedValue(undefined);

       await service.remove(1, mockUsuarioLogado);

       expect(mockUsuarioRepository.findOneBy).toHaveBeenCalledWith({ id_usuario: 1 });
       expect(mockUsuarioRepository.remove).toHaveBeenCalledWith(mockUsuario);
     });

     it('deve lançar ForbiddenException se tentar remover outro usuário', async () => {
       const outroUsuario = new Usuario();
       outroUsuario.id_usuario = 2;
       mockUsuarioRepository.findOneBy.mockResolvedValue(outroUsuario); 
       await expect(service.remove(2, mockUsuarioLogado)).rejects.toThrow(ForbiddenException);
       expect(mockUsuarioRepository.remove).not.toHaveBeenCalled();
     });

     it('deve lançar NotFoundException se o usuário a remover não existir (find one falha)', async () => {
        mockUsuarioRepository.findOneBy.mockResolvedValue(null);
        await expect(service.remove(1, mockUsuarioLogado)).rejects.toThrow(NotFoundException);
        expect(mockUsuarioRepository.remove).not.toHaveBeenCalled();
     })
  });
});

describe('Usuario Entity', () => {
    let usuario: Usuario;

    beforeEach(() => {
        jest.clearAllMocks();
        usuario = new Usuario();
        usuario.senha = 'senhaHashedPeloBcrypt';
    });

    describe('validatePassword', () => {
        it('deve retornar true se bcrypt.compare retornar true', async () => {
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            const senhaDigitada = 'senhaCorreta';

            const resultado = await usuario.validatePassword(senhaDigitada);

            expect(bcrypt.compare).toHaveBeenCalledWith(senhaDigitada, usuario.senha);
            expect(resultado).toBe(true);
        });

        it('deve retornar false se bcrypt.compare retornar false', async () => {
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);
            const senhaDigitada = 'senhaIncorreta';

            const resultado = await usuario.validatePassword(senhaDigitada);

            expect(bcrypt.compare).toHaveBeenCalledWith(senhaDigitada, usuario.senha);
            expect(resultado).toBe(false);
        });
    });
});