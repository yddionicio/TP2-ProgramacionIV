import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PublicacionDocument = HydratedDocument<Publicacion>;

@Schema({ timestamps: true })
export class Publicacion {
  @Prop({ required: true, trim: true, maxlength: 100 }) titulo: string;
  @Prop({ required: true, trim: true, maxlength: 500 }) mensaje: string;
  @Prop() imagenUrl?: string;
  @Prop() imagenPublicId?: string;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) autor: Types.ObjectId;
  @Prop({ default: 0, index: true }) likesCount: number; // para ordenar por me gusta
  @Prop({ default: true, index: true }) activa: boolean; // baja lógica
}
export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);