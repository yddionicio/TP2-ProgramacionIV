import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';
import { Comentario, ComentarioDocument } from './schemas/comentario.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { RangoEstadisticasDto } from './dto/rango-estadisticas.dto';

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name) private readonly pubModel: Model<PublicacionDocument>,
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<ComentarioDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  private procesarRango(q: RangoEstadisticasDto) {
    const hoyArgentina = new Date().toLocaleDateString('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires',
    });
    const hastaStr = q.hasta || hoyArgentina;
    const hastaDate = new Date(`${hastaStr}T23:59:59.999-03:00`);

    let desdeStr = q.desde;
    if (!desdeStr) {
      const hace30 = new Date(hastaDate.getTime() - 29 * 24 * 60 * 60 * 1000);
      desdeStr = hace30.toLocaleDateString('en-CA', {
        timeZone: 'America/Argentina/Buenos_Aires',
      });
    }
    const desdeDate = new Date(`${desdeStr}T00:00:00.000-03:00`);

    if (isNaN(desdeDate.getTime()) || isNaN(hastaDate.getTime())) {
      throw new BadRequestException('Formato de fecha inválido. Utilizá YYYY-MM-DD');
    }

    if (desdeDate.getTime() > hastaDate.getTime()) {
      throw new BadRequestException('La fecha desde no puede ser posterior a la fecha hasta');
    }

    const diffDias = (hastaDate.getTime() - desdeDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDias > 90) {
      throw new BadRequestException('El rango de fechas no puede superar los 90 días');
    }

    return { desdeStr, hastaStr, desdeDate, hastaDate };
  }

  async publicacionesPorUsuario(q: RangoEstadisticasDto) {
    const { desdeStr, hastaStr, desdeDate, hastaDate } = this.procesarRango(q);

    const res = await this.pubModel.aggregate([
      {
        $match: {
          activa: true,
          createdAt: { $gte: desdeDate, $lte: hastaDate },
        },
      },
      {
        $group: {
          _id: '$autor',
          total: { $sum: 1 },
        },
      },
      {
        $sort: { total: -1, _id: 1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: this.userModel.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'autorDoc',
        },
      },
      {
        $unwind: '$autorDoc',
      },
      {
        $project: {
          nombreUsuario: '$autorDoc.nombreUsuario',
          total: 1,
        },
      },
    ]);

    const etiquetas = res.map((r) => r.nombreUsuario);
    const valores = res.map((r) => r.total);
    const total = valores.reduce((acc, v) => acc + v, 0);

    return {
      desde: desdeStr,
      hasta: hastaStr,
      total,
      etiquetas,
      valores,
    };
  }

  async comentariosPorDia(q: RangoEstadisticasDto) {
    const { desdeStr, hastaStr, desdeDate, hastaDate } = this.procesarRango(q);

    const res = await this.comentarioModel.aggregate([
      {
        $match: {
          createdAt: { $gte: desdeDate, $lte: hastaDate },
        },
      },
      {
        $lookup: {
          from: this.pubModel.collection.name,
          localField: 'publicacion',
          foreignField: '_id',
          as: 'pubDoc',
        },
      },
      { $unwind: '$pubDoc' },
      {
        $match: {
          'pubDoc.activa': true,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              timezone: 'America/Argentina/Buenos_Aires',
            },
          },
          total: { $sum: 1 },
        },
      },
    ]);

    const mapa = new Map<string, number>();
    res.forEach((r) => mapa.set(r._id, r.total));

    const etiquetas: string[] = [];
    const valores: number[] = [];

    // Llenar continuamente todos los días del rango con 0 para días sin comentarios
    const curr = new Date(desdeDate.getTime());
    while (curr <= hastaDate) {
      const dia = curr.toLocaleDateString('en-CA', {
        timeZone: 'America/Argentina/Buenos_Aires',
      });
      if (!etiquetas.includes(dia)) {
        etiquetas.push(dia);
        valores.push(mapa.get(dia) ?? 0);
      }
      curr.setDate(curr.getDate() + 1);
    }

    const total = valores.reduce((acc, v) => acc + v, 0);

    return {
      desde: desdeStr,
      hasta: hastaStr,
      total,
      etiquetas,
      valores,
    };
  }

  async comentariosPorPublicacion(q: RangoEstadisticasDto) {
    const { desdeStr, hastaStr, desdeDate, hastaDate } = this.procesarRango(q);

    const res = await this.comentarioModel.aggregate([
      {
        $match: {
          createdAt: { $gte: desdeDate, $lte: hastaDate },
        },
      },
      {
        $lookup: {
          from: this.pubModel.collection.name,
          localField: 'publicacion',
          foreignField: '_id',
          as: 'pubDoc',
        },
      },
      { $unwind: '$pubDoc' },
      {
        $match: {
          'pubDoc.activa': true,
        },
      },
      {
        $group: {
          _id: '$publicacion',
          titulo: { $first: '$pubDoc.titulo' },
          total: { $sum: 1 },
        },
      },
      {
        $sort: { total: -1, _id: 1 },
      },
      {
        $limit: 10,
      },
    ]);

    const etiquetas = res.map((r) => r.titulo);
    const valores = res.map((r) => r.total);
    const total = valores.reduce((acc, v) => acc + v, 0);

    return {
      desde: desdeStr,
      hasta: hastaStr,
      total,
      etiquetas,
      valores,
    };
  }
}
