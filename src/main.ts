import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.enableCors({
  //   origin: ['https://test.app.qaing.co', 'https://app.qaing.co'],
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   credentials: true,
  // });
  app.use(cookieParser());

  await app.listen(8080, () =>
    console.log('Dev : Nest.JS Server started on 8080'),
  );
}
bootstrap();
