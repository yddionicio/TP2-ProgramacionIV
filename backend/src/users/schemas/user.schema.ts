import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  apellido: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  correo: string;

  @Prop({ required: true, unique: true, trim: true })
  nombreUsuario: string;

  @Prop({ required: true })
  password: string; // se guarda el hash, nunca la contraseña real

  @Prop({ required: true })
  fechaNacimiento: Date;

  @Prop({ default: '' })
  descripcion: string;

  @Prop()
  imagenPerfil: string; // URL de la imagen

  @Prop({ enum: ['usuario', 'administrador'], default: 'usuario' })
  perfil: string;

  @Prop({ default: true })
  activo: boolean; // se usa en el Sprint 4 (baja lógica)
}

export const UserSchema = SchemaFactory.createForClass(User);