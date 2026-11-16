import { Controller, Get, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { UsuarioActual, UsuarioToken } from '../auth/usuario-actual.decorator';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  async me(@UsuarioActual() u: UsuarioToken) {
    const user = await this.users.findById(u.sub);
    if (!user || !user.activo) throw new UnauthorizedException('Usuario no disponible');
    return user; // la contraseña no sale (select: false)
  }
}