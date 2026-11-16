import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
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
    const existe = await this.users.findByCorreoOUsuario(dto.correo, dto.nombreUsuario);
    if (existe) throw new ConflictException('El correo o el usuario ya existe'); // 409

    // se sube la imagen recién después de validar, para no dejar archivos huérfanos
    let imagenPerfil: string | undefined;
    if (file) imagenPerfil = (await this.cloudinary.subirImagen(file, 'perfiles')).url;

    const password = await bcrypt.hash(dto.password, 10);
    const { repetirPassword, ...datos } = dto;
    const user = await this.users.create({
      ...datos,
      fechaNacimiento: new Date(dto.fechaNacimiento),
      password,
      imagenPerfil,
    });
    return { usuario: this.sanitizar(user), token: await this.firmar(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByIdentificador(dto.identificador);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Credenciales inválidas'); // 401
    }
    return { usuario: this.sanitizar(user), token: await this.firmar(user) };
  }

  // payload mínimo: nunca contraseñas ni datos sensibles, porque el token se puede leer
  private firmar(user: UserDocument) {
    return this.jwt.signAsync({ sub: user.id, nombreUsuario: user.nombreUsuario, perfil: user.perfil });
  }

  private sanitizar(user: UserDocument) {
    const { password, ...resto } = user.toObject();
    return resto;
  }
}