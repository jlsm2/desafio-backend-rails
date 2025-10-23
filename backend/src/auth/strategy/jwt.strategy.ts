import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuarioService } from '../../usuario/usuario.service';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usuarioService: UsuarioService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    console.log('JwtStrategy JWT_SECRET:', secret);
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret!,
    });
  }

  async validate(payload: { sub: number; email: string }): Promise<Usuario> {
    const usuario = await this.usuarioService.findOne(payload.sub);

    if (!usuario) {
      throw new UnauthorizedException('Usuário do token não encontrado.');
    }

    (usuario as any).senha = undefined;
    return usuario;
  }
}