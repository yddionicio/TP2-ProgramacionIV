import { BadRequestException, ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { UsuarioToken } from './usuario-actual.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async registro(dto: RegisterDto, file?: Express.Multer.File) {
    if (dto.password !== dto.repetirPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }
    const usuario = await this.users.crearUsuario(dto, file, true);
    return { usuario, token: await this.firmar(usuario) };
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByIdentificador(dto.identificador);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas'); // 401
    }
    if (user.activo === false) {
      throw new ForbiddenException('Tu cuenta está deshabilitada. Contactá a un administrador.'); // 403
    }
    return { usuario: this.sanitizar(user), token: await this.firmar(user) };
  }

  async autorizar(u: UsuarioToken) {
    const user = await this.users.findById(u.sub);
    if (!user || user.activo === false) {
      throw new UnauthorizedException('Usuario no válido o deshabilitado');
    }
    const ahoraSeg = Math.floor(Date.now() / 1000);
    const expSeg = u.exp ?? ahoraSeg + (Number(process.env.JWT_EXPIRES_SEG) || 900);
    const sesionExpiraEn = Math.max(0, expSeg - ahoraSeg);
    return {
      ...this.sanitizar(user),
      sesionExpiraEn,
    };
  }

  async refrescar(u: UsuarioToken) {
    const user = await this.users.findById(u.sub);
    if (!user || user.activo === false) {
      throw new UnauthorizedException('Usuario no válido o deshabilitado');
    }
    // IMPORTANTE: firmar un payload nuevo con solo { sub, nombreUsuario, perfil }; no copiar exp ni iat
    const nuevoPayload = {
      sub: user.id,
      nombreUsuario: user.nombreUsuario,
      perfil: user.perfil,
    };
    const token = await this.jwt.signAsync(nuevoPayload);
    return { usuario: this.sanitizar(user), token };
  }

  // payload mínimo: nunca contraseñas ni datos sensibles, porque el token se puede leer
  private firmar(user: { id?: string; _id?: any; nombreUsuario: string; perfil: string }) {
    return this.jwt.signAsync({
      sub: (user.id || user._id)?.toString(),
      nombreUsuario: user.nombreUsuario,
      perfil: user.perfil,
    });
  }

  private sanitizar(user: UserDocument) {
    const { password, ...resto } = user.toObject();
    return resto;
  }
}