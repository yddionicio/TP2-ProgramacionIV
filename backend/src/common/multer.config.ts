import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';

export const perfilUpload = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const dir = './uploads/perfiles';
      mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const sufijo = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${sufijo}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Solo se permiten imágenes'), false);
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
};