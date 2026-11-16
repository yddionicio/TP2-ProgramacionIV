import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private configurado = false;

  constructor(config: ConfigService) {
    const cloud_name = config.get<string>('CLOUDINARY_CLOUD_NAME');
    const api_key = config.get<string>('CLOUDINARY_API_KEY');
    const api_secret = config.get<string>('CLOUDINARY_API_SECRET');

    if (cloud_name && api_key && api_secret) {
      cloudinary.config({ cloud_name, api_key, api_secret });
      this.configurado = true;
    } else {
      console.warn('⚠️  Cloudinary NO configurado: faltan variables CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY o CLOUDINARY_API_SECRET');
    }
  }

  subirImagen(file: Express.Multer.File, carpeta: string): Promise<{ url: string; publicId: string }> {
    if (!this.configurado) {
      return Promise.reject(
        new InternalServerErrorException('El servicio de imágenes no está configurado. Contactá al administrador.'),
      );
    }

    if (!file || !file.buffer || file.buffer.length === 0) {
      return Promise.reject(
        new BadRequestException('No se recibió ninguna imagen válida. Por favor, seleccioná una imagen e intentá de nuevo.'),
      );
    }

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `redsocial/${carpeta}`,
          resource_type: 'image',
          transformation: [{ width: 1200, crop: 'limit' }],
        },
        (error, result) => {
          if (error || !result) {
            console.error('Cloudinary upload error:', error);
            return reject(
              new BadRequestException('No se pudo subir la imagen. Por favor, intentá con otra imagen o sin imagen.'),
            );
          }
          resolve({
            url: result.secure_url.replace('/upload/', '/upload/f_auto,q_auto/'),
            publicId: result.public_id,
          });
        },
      );

      // Capturar errores del stream de escritura
      stream.on('error', (err) => {
        console.error('Cloudinary stream error:', err);
        reject(new BadRequestException('Hubo un problema al procesar la imagen. Intentá con otra imagen.'));
      });

      Readable.from(file.buffer).pipe(stream);
    });
  }
}
