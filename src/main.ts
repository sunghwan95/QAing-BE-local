import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  app.enableCors({
    origin: '*',
    credentials: true,
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
  });
  app.use(cookieParser());
  app.setBaseViewsDir(join(__dirname, '../', 'views'));
  app.setViewEngine('ejs');
  await app.listen(8080, () => console.log('Nest.JS Server started on 8080'));
}
bootstrap();
