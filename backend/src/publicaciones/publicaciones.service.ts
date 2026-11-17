import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { UsuarioToken } from '../auth/usuario-actual.decorator';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';
import { Like, LikeDocument } from './schemas/like.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto';
import { ListarPublicacionesDto } from './dto/listar-publicaciones.dto';
import { RankingDto } from './dto/ranking.dto';

const CAMPOS_AUTOR = 'nombreUsuario imagenPerfil'; // solo lo necesario: nunca correo ni contraseña

// Pesos de impacto para el cálculo del ranking.
// Luego se sumarán comentario, guardado y compartido cuando existan esas funciones.
export const PESOS_IMPACTO = {
  like: 1,
};

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private readonly pubModel: Model<PublicacionDocument>,
    @InjectModel(Like.name) private readonly likeModel: Model<LikeDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async crear(dto: CrearPublicacionDto, usuarioId: string, file?: Express.Multer.File) {
    let imagenUrl: string | undefined;
    let imagenPublicId: string | undefined;

    if (file) {
      try {
        const r = await this.cloudinary.subirImagen(file, 'publicaciones');
        imagenUrl = r.url;
        imagenPublicId = r.publicId;
      } catch (error: any) {
        console.error('Error al subir imagen de publicación:', error?.message ?? error);
        // Si el error ya es una HttpException (BadRequest, etc.), lo relanzamos tal cual
        if (error?.status) throw error;
        throw new BadRequestException('No se pudo subir la imagen. Intentá publicar sin imagen o con una imagen más pequeña.');
      }
    }

    const pub = await this.pubModel.create({
      ...dto,
      autor: new Types.ObjectId(usuarioId),
      imagenUrl,
      imagenPublicId,
    });
    await pub.populate('autor', CAMPOS_AUTOR);
    return { ...pub.toObject(), meGusta: false };
  }

  async listar(q: ListarPublicacionesDto, usuarioId: string) {
    const filtro: Record<string, any> = { activa: true };
    if (q.usuario) filtro.autor = new Types.ObjectId(q.usuario);
    if (q.categoria) filtro.categoria = q.categoria;
    const sort: Record<string, 1 | -1> =
      q.orden === 'likes' ? { likesCount: -1, createdAt: -1 } : { createdAt: -1 };

    const [items, total] = await Promise.all([
      this.pubModel.find(filtro).sort(sort).skip(q.offset).limit(q.limit)
        .populate('autor', CAMPOS_AUTOR).lean(),
      this.pubModel.countDocuments(filtro),
    ]);

    // qué publicaciones de esta página ya likeó el usuario actual
    const likes = await this.likeModel
      .find({ usuario: new Types.ObjectId(usuarioId), publicacion: { $in: items.map((i) => i._id) } })
      .select('publicacion').lean();
    const likeadas = new Set(likes.map((l) => l.publicacion.toString()));

    return {
      items: items.map((i) => ({ ...i, meGusta: likeadas.has(i._id.toString()) })),
      total,
      offset: q.offset,
      limit: q.limit,
    };
  }

  async eliminar(id: string, usuario: UsuarioToken) {
    const pub = await this.pubModel.findOne({ _id: id, activa: true });
    if (!pub) throw new NotFoundException('La publicación no existe'); // 404
    const esAutor = pub.autor.toString() === usuario.sub;
    if (!esAutor && usuario.perfil !== 'administrador') {
      throw new ForbiddenException('No podés eliminar esta publicación'); // 403
    }
    pub.activa = false; // baja lógica: el documento se conserva
    await pub.save();
    return { mensaje: 'Publicación eliminada' };
  }

  async darMeGusta(id: string, usuarioId: string) {
    const existe = await this.pubModel.exists({ _id: id, activa: true });
    if (!existe) throw new NotFoundException('La publicación no existe');
    try {
      await this.likeModel.create({
        publicacion: new Types.ObjectId(id),
        usuario: new Types.ObjectId(usuarioId),
      });
    } catch (e: any) {
      // 11000 = el índice único detectó un duplicado
      if (e?.code === 11000) throw new ConflictException('Ya le diste me gusta a esta publicación');
      throw e;
    }
    const pub = await this.pubModel.findByIdAndUpdate(id, { $inc: { likesCount: 1 } }, { new: true });
    return { likesCount: pub?.likesCount ?? 0, meGusta: true };
  }

  async quitarMeGusta(id: string, usuarioId: string) {
    const r = await this.likeModel.deleteOne({ publicacion: id, usuario: usuarioId });
    if (r.deletedCount === 0) throw new BadRequestException('No habías dado me gusta a esta publicación');
    const pub = await this.pubModel.findByIdAndUpdate(id, { $inc: { likesCount: -1 } }, { new: true });
    return { likesCount: pub?.likesCount ?? 0, meGusta: false };
  }

  async ranking(q: RankingDto) {
    let fechaInicio: Date | null = null;
    const ahora = new Date();
    if (q.periodo === 'semana') {
      fechaInicio = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (q.periodo === 'mes') {
      fechaInicio = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const pipeline: any[] = [];

    if (fechaInicio) {
      pipeline.push({ $match: { createdAt: { $gte: fechaInicio } } });
    }

    pipeline.push(
      {
        $lookup: {
          from: this.pubModel.collection.name,
          localField: 'publicacion',
          foreignField: '_id',
          as: 'publicacionDoc',
        },
      },
      { $unwind: '$publicacionDoc' },
      {
        $match: {
          'publicacionDoc.activa': true,
          $expr: { $ne: ['$usuario', '$publicacionDoc.autor'] },
        },
      },
      {
        $group: {
          _id: '$publicacion',
          puntos: { $sum: PESOS_IMPACTO.like },
          publicacionDoc: { $first: '$publicacionDoc' },
        },
      },
      {
        $sort: {
          puntos: -1,
          'publicacionDoc.createdAt': 1,
          _id: 1,
        },
      },
      { $limit: q.limit },
      {
        $lookup: {
          from: this.userModel.collection.name,
          localField: 'publicacionDoc.autor',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                _id: 1,
                nombreUsuario: 1,
                imagenPerfil: 1,
              },
            },
          ],
          as: 'autorDoc',
        },
      },
      {
        $unwind: {
          path: '$autorDoc',
          preserveNullAndEmptyArrays: true,
        },
      },
    );

    const raw = await this.likeModel.aggregate(pipeline);

    const items = raw.map((r, index) => ({
      posicion: index + 1,
      puntos: r.puntos,
      publicacion: {
        _id: r.publicacionDoc._id,
        titulo: r.publicacionDoc.titulo,
        mensaje: r.publicacionDoc.mensaje,
        categoria: r.publicacionDoc.categoria || 'idea',
        imagenUrl: r.publicacionDoc.imagenUrl,
        createdAt: r.publicacionDoc.createdAt,
        likesCount: r.publicacionDoc.likesCount,
        autor: {
          _id: r.autorDoc?._id ?? r.publicacionDoc.autor,
          nombreUsuario: r.autorDoc?.nombreUsuario ?? '',
          imagenPerfil: r.autorDoc?.imagenPerfil ?? '',
        },
      },
    }));

    return {
      periodo: q.periodo,
      items,
    };
  }
}
