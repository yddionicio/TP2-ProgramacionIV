import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comentario, ComentarioDocument } from './schemas/comentario.schema';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';
import { CrearComentarioDto } from './dto/crear-comentario.dto';
import { ActualizarComentarioDto } from './dto/actualizar-comentario.dto';
import { ListarComentariosDto } from './dto/listar-comentarios.dto';

const CAMPOS_AUTOR = 'nombreUsuario imagenPerfil';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name) private readonly comentarioModel: Model<ComentarioDocument>,
    @InjectModel(Publicacion.name) private readonly pubModel: Model<PublicacionDocument>,
  ) {}

  private async verificarPublicacionActiva(publicacionId: string) {
    const pub = await this.pubModel.findOne({ _id: publicacionId, activa: true });
    if (!pub) {
      throw new NotFoundException('La publicación no existe o fue dada de baja');
    }
    return pub;
  }

  async crear(publicacionId: string, usuarioId: string, dto: CrearComentarioDto) {
    await this.verificarPublicacionActiva(publicacionId);

    const comentario = await this.comentarioModel.create({
      publicacion: new Types.ObjectId(publicacionId),
      autor: new Types.ObjectId(usuarioId),
      mensaje: dto.mensaje.trim(),
    });

    // Sumar 1 al contador de comentarios de la publicación
    await this.pubModel.findByIdAndUpdate(publicacionId, { $inc: { comentariosCount: 1 } });

    await comentario.populate('autor', CAMPOS_AUTOR);
    return comentario.toObject();
  }

  async actualizar(publicacionId: string, comentarioId: string, usuarioId: string, dto: ActualizarComentarioDto) {
    await this.verificarPublicacionActiva(publicacionId);

    const comentario = await this.comentarioModel.findOne({
      _id: comentarioId,
      publicacion: new Types.ObjectId(publicacionId),
    });

    if (!comentario) {
      throw new NotFoundException('El comentario no existe');
    }

    if (comentario.autor.toString() !== usuarioId) {
      throw new ForbiddenException('No tenés permisos para editar este comentario');
    }

    comentario.mensaje = dto.mensaje.trim();
    comentario.modificado = true;
    await comentario.save();

    await comentario.populate('autor', CAMPOS_AUTOR);
    return comentario.toObject();
  }

  async listar(publicacionId: string, q: ListarComentariosDto) {
    await this.verificarPublicacionActiva(publicacionId);

    const filtro = { publicacion: new Types.ObjectId(publicacionId) };

    const [items, total] = await Promise.all([
      this.comentarioModel
        .find(filtro)
        .sort({ createdAt: -1 })
        .skip(q.offset)
        .limit(q.limit)
        .populate('autor', CAMPOS_AUTOR)
        .lean(),
      this.comentarioModel.countDocuments(filtro),
    ]);

    return {
      items,
      total,
      offset: q.offset,
      limit: q.limit,
    };
  }
}
