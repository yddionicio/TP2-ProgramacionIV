import { Controller } from '@nestjs/common';
import { Body, Post, UseInterceptors, UploadedFile, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { perfilUpload } from '../common/multer.config';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('registro') // 201 por defecto
  @UseInterceptors(FileInterceptor('imagenPerfil', perfilUpload))
  registro(@Body() dto: RegisterDto, @UploadedFile() file?: Express.Multer.File) {
    return this.auth.registro(dto, file);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK) // los POST devuelven 201 por defecto; el login exitoso es 200
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
}