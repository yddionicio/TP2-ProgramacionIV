import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ComentarioDocument = HydratedDocument<Comentario>;

@Schema({ timestamps: true })
export class Comentario {
  @Prop({ type: Types.ObjectId, ref: 'Publicacion', required: true, index: true })
  publicacion: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autor: Types.ObjectId;

  @Prop({ required: true, trim: true, minlength: 1, maxlength: 500 })
  mensaje: string;

  @Prop({ default: false })
  modificado: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);

// Índice compuesto para consultar los comentarios de una publicación ordenados por fecha
ComentarioSchema.index({ publicacion: 1, createdAt: -1 });
