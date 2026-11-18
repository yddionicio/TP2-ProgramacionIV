import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsuarioActual, UsuarioToken } from '../auth/usuario-actual.decorator';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { perfilUpload } from '../common/multer.config';
import { UsersService } from './users.service';
import { ListarUsuariosDto } from './dto/listar-usuarios.dto';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';

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

  @Get()
  @UseGuards(RolesGuard)
  @Roles('administrador')
  listar(@Query() q: ListarUsuariosDto) {
    return this.users.listar(q);
  }

  @Post() // 201
  @UseGuards(RolesGuard)
  @Roles('administrador')
  @UseInterceptors(FileInterceptor('imagenPerfil', perfilUpload))
  crear(
    @Body() dto: CrearUsuarioDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.users.crearUsuario(dto, file, false);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  deshabilitar(
    @Param('id', ParseObjectIdPipe) id: string,
    @UsuarioActual() admin: UsuarioToken,
  ) {
    return this.users.deshabilitar(id, admin.sub);
  }

  @Post(':id/habilitar')
  @UseGuards(RolesGuard)
  @Roles('administrador')
  @HttpCode(HttpStatus.OK)
  habilitar(@Param('id', ParseObjectIdPipe) id: string) {
    return this.users.habilitar(id);
  }
}
