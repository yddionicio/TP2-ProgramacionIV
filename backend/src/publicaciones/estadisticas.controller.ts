import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { EstadisticasService } from './estadisticas.service';
import { RangoEstadisticasDto } from './dto/rango-estadisticas.dto';

@Controller('estadisticas')
@UseGuards(AuthGuard, RolesGuard)
@Roles('administrador')
export class EstadisticasController {
  constructor(private readonly service: EstadisticasService) {}

  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(@Query() q: RangoEstadisticasDto) {
    return this.service.publicacionesPorUsuario(q);
  }

  @Get('comentarios-por-dia')
  comentariosPorDia(@Query() q: RangoEstadisticasDto) {
    return this.service.comentariosPorDia(q);
  }

  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(@Query() q: RangoEstadisticasDto) {
    return this.service.comentariosPorPublicacion(q);
  }
}
