import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { UsuarioActual, UsuarioToken } from '../auth/usuario-actual.decorator';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { ComentariosService } from './comentarios.service';
import { CrearComentarioDto } from './dto/crear-comentario.dto';
import { ActualizarComentarioDto } from './dto/actualizar-comentario.dto';
import { ListarComentariosDto } from './dto/listar-comentarios.dto';

@Controller('publicaciones/:id/comentarios')
@UseGuards(AuthGuard)
export class ComentariosController {
  constructor(private readonly service: ComentariosService) {}

  @Post() // 201
  crear(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: CrearComentarioDto,
    @UsuarioActual() u: UsuarioToken,
  ) {
    return this.service.crear(id, u.sub, dto);
  }

  @Put(':comentarioId') // 200
  @HttpCode(HttpStatus.OK)
  actualizar(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('comentarioId', ParseObjectIdPipe) comentarioId: string,
    @Body() dto: ActualizarComentarioDto,
    @UsuarioActual() u: UsuarioToken,
  ) {
    return this.service.actualizar(id, comentarioId, u.sub, dto);
  }

  @Get() // 200
  listar(
    @Param('id', ParseObjectIdPipe) id: string,
    @Query() q: ListarComentariosDto,
  ) {
    return this.service.listar(id, q);
  }
}
