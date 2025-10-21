import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from '../usuario/usuario.service';
import { CreateUsuarioDto } from '../usuario/dto/create-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { Usuario } from '../usuario/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUsuarioDto: CreateUsuarioDto) {
    try {
      const novoUsuario = await this.usuarioService.create(createUsuarioDto);
      const { senha, ...usuarioSemSenha } = novoUsuario;
      return usuarioSemSenha;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('Este e-mail já está em uso.');
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const usuario = await this.usuarioService.findOneByEmail(loginDto.email);

    if (!usuario) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const senhaValida = await usuario.validatePassword(loginDto.senha);

    if (!senhaValida) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const payload = {
      sub: usuario.id_usuario,
      email: usuario.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}