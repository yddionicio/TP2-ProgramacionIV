import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';

export const imagenUpload = {
  storage: memoryStorage(),
  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Solo se permiten archivos de imagen (JPG, PNG, GIF, WEBP)'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
};

export const perfilUpload = imagenUpload;

