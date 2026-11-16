import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { createReadStream, unlinkSync } from 'fs';

@Injectable()
export class CloudinaryService {
  constructor(config: ConfigService) {
    cloudinary.config({
      cloud_name: config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: config.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  subirImagen(file: Express.Multer.File, carpeta: string): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `redsocial/${carpeta}`,
          resource_type: 'image',
          transformation: [{ width: 1200, crop: 'limit' }], // limita el tamaño al subir
        },
        (error, result) => {
          if (error || !result) {
            return reject(new BadRequestException(`No se pudo subir la imagen: ${error?.message ?? 'error desconocido'}`));
          }
          resolve({
            // f_auto,q_auto: Cloudinary entrega el mejor formato y calidad para cada navegador
            url: result.secure_url.replace('/upload/', '/upload/f_auto,q_auto/'),
            publicId: result.public_id,
          });
        },
      );

      if (file.buffer) {
        Readable.from(file.buffer).pipe(stream);
      } else if (file.path) {
        const fileStream = createReadStream(file.path);
        fileStream.pipe(stream);
        fileStream.on('close', () => {
          try { unlinkSync(file.path); } catch {}
        });
      } else {
        reject(new BadRequestException('El archivo de imagen no contiene datos válidos'));
      }
    });
  }
}
