import { Body, Controller, Delete, Get, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';
import { UsuarioActual, UsuarioToken } from '../auth/usuario-actual.decorator';
import { perfilUpload } from '../common/multer.config';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto';
import { PublicacionesService } from './publicaciones.service';

@Controller('publicaciones')
@UseGuards(AuthGuard) // toda la app exige estar logueado
export class PublicacionesController {
  constructor(private readonly service: PublicacionesService) {}

  @Post() // 201
  @UseInterceptors(FileInterceptor('imagen', perfilUpload))
  crear(@Body() dto: CrearPublicacionDto, @UsuarioActual() u: UsuarioToken, @UploadedFile() file?: Express.Multer.File) {
    return this.service.crear(dto, u.sub, file);
  }

  @Get()
  listar(@Query() q: ListarPublicacionesDto, @UsuarioActual() u: UsuarioToken) {
    return this.service.listar(q, u.sub);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseObjectIdPipe) id: string, @UsuarioActual() u: UsuarioToken) {
    return this.service.eliminar(id, u);
  }

  @Post(':id/like') // 201
  darMeGusta(@Param('id', ParseObjectIdPipe) id: string, @UsuarioActual() u: UsuarioToken) {
    return this.service.darMeGusta(id, u.sub);
  }

  @Delete(':id/like')
  quitarMeGusta(@Param('id', ParseObjectIdPipe) id: string, @UsuarioActual() u: UsuarioToken) {
    return this.service.quitarMeGusta(id, u.sub);
  }
}