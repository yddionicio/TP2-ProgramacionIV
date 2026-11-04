import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
constructor(private readonly users: UsersService) {}
async registro(dto: RegisterDto, file?: Express.Multer.File) {
  if (dto.password !== dto.repetirPassword)
    throw new BadRequestException('Las contraseñas no coinciden');

  const existe = await this.users.findByCorreoOUsuario(dto.correo, dto.nombreUsuario);
  if (existe) throw new ConflictException('El correo o el usuario ya existe'); // 409

  const password = await bcrypt.hash(dto.password, 10);
    const { repetirPassword, ...datos } = dto; // no se guarda en la base

    const user = await this.users.create({
      ...datos,
      fechaNacimiento: new Date(dto.fechaNacimiento),
      password,
      imagenPerfil: file ? `/uploads/perfiles/${file.filename}` : undefined,
    });
    return this.sanitizar(user);
}

async login(dto: LoginDto) {
  const user = await this.users.findByIdentificador(dto.identificador); // $or correo (lowercase) / nombreUsuario
  if (!user || !(await bcrypt.compare(dto.password, user.password)))
    throw new UnauthorizedException('Credenciales inválidas'); // 401
  return this.sanitizar(user);
}

private sanitizar(user: UserDocument) {
  const { password, ...resto } = user.toObject();
  return resto;
}


}

