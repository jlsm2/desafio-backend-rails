import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  private cleanUsuario(usuario: Usuario | Usuario[]): Usuario | Usuario[] {
    if (Array.isArray(usuario)) {
      return usuario.map((u) => {
        delete (u as Partial<Usuario>).senha;
        return u;
      });
    }
    delete (usuario as Partial<Usuario>).senha;
    return usuario;
  }

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const usuarioExistente = await this.findOneByEmail(createUsuarioDto.email);
    if (usuarioExistente) {
      throw new ConflictException('Este e-mail já está em uso.');
    }

    const novoUsuario = this.usuarioRepository.create(createUsuarioDto);
    const usuarioSalvo = await this.usuarioRepository.save(novoUsuario);

    return this.cleanUsuario(usuarioSalvo) as Usuario;
  }

  async findOneByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOneBy({ email });
  }

  async findAll(): Promise<Usuario[]> {
    const usuarios = await this.usuarioRepository.find({
      select: ['id_usuario', 'email'],
    });
    return usuarios;
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOneBy({ id_usuario: id });
    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }
    return this.cleanUsuario(usuario) as Usuario;
  }

  async update(
    id: number,
    dto: UpdateUsuarioDto,
    usuarioLogado: Usuario,
  ): Promise<Usuario> {
    if (usuarioLogado.id_usuario !== id) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar este usuário.',
      );
    }

    if (dto.senha) {
      dto.senha = await bcrypt.hash(dto.senha, 10);
    }

    await this.usuarioRepository.update(id, dto);

    return this.findOne(id);
  }

  async remove(id: number, usuarioLogado: Usuario): Promise<void> {
    if (usuarioLogado.id_usuario !== id) {
      throw new ForbiddenException(
        'Você não tem permissão para remover este usuário.',
      );
    }

    const usuario = await this.findOne(id);

    await this.usuarioRepository.remove(usuario);
  }
}