import * as dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
 const app = await NestFactory.create(AppModule);
app.enableCors({
  origin: ['http://localhost:4200', process.env.FRONTEND_URL].filter(Boolean) as string[],
});
 app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
 await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
