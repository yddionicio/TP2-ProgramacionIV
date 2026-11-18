import * as dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser()); // permite leer req.cookies

  const frontendUrl = process.env.FRONTEND_URL?.trim().replace(/\/$/, '');
  console.log('FRONTEND_URL =', JSON.stringify(process.env.FRONTEND_URL));

  app.enableCors({
    origin: [
      'http://localhost:4200',
      'https://plot-yd.netlify.app',
      frontendUrl,
    ].filter(Boolean) as string[],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
