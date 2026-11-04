import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PublicacionesModule } from './publicaciones/publicaciones.module';

@Module({
  imports: [
    // Carga las variables del archivo .env y las hace accesibles en toda la app
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexión a MongoDB, leyendo la URI desde el .env
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),

    // Expone la carpeta /uploads para poder ver las imágenes por URL
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    // Módulos de la aplicación
    UsersModule,
    AuthModule,
    PublicacionesModule,
  ],
})
export class AppModule {}