import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { UsuarioActual, UsuarioToken } from './usuario-actual.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { perfilUpload } from '../common/multer.config';

const COOKIE = 'access_token';
const esProduccion = process.env.NODE_ENV === 'production';
const opcionesCookie = () => ({
  httpOnly: true, // JavaScript del navegador no puede leerla
  secure: esProduccion, // solo por HTTPS en producción
  sameSite: (esProduccion ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
});

const obtenerJwtExpiresSeg = () => Number(process.env.JWT_EXPIRES_SEG || 900);

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('registro') // 201
  @UseInterceptors(FileInterceptor('imagenPerfil', perfilUpload))
  async registro(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const { usuario, token } = await this.auth.registro(dto, file);
    res.cookie(COOKIE, token, { ...opcionesCookie(), maxAge: obtenerJwtExpiresSeg() * 1000 });
    return usuario;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { usuario, token } = await this.auth.login(dto);
    res.cookie(COOKIE, token, { ...opcionesCookie(), maxAge: obtenerJwtExpiresSeg() * 1000 });
    return usuario;
  }

  @Post('autorizar')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  autorizar(@UsuarioActual() u: UsuarioToken) {
    return this.auth.autorizar(u);
  }

  @Post('refrescar')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async refrescar(
    @UsuarioActual() u: UsuarioToken,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { usuario, token } = await this.auth.refrescar(u);
    res.cookie(COOKIE, token, { ...opcionesCookie(), maxAge: obtenerJwtExpiresSeg() * 1000 });
    return usuario;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE, opcionesCookie());
    return { mensaje: 'Sesión cerrada' };
  }
}
