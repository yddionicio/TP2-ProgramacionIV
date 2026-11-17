import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from '../common/cloudinary/cloudinary.module';
import { PublicacionesController } from './publicaciones.controller';
import { PublicacionesService } from './publicaciones.service';
import { ComentariosController } from './comentarios.controller';
import { ComentariosService } from './comentarios.service';
import { Publicacion, PublicacionSchema } from './schemas/publicacion.schema';
import { Like, LikeSchema } from './schemas/like.schema';
import { Comentario, ComentarioSchema } from './schemas/comentario.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Comentario.name, schema: ComentarioSchema },
      { name: User.name, schema: UserSchema },
    ]),
    CloudinaryModule,
  ],
  controllers: [PublicacionesController, ComentariosController],
  providers: [PublicacionesService, ComentariosService],
  exports: [PublicacionesService, ComentariosService],
})
export class PublicacionesModule {}
