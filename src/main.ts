import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    cors({
      origin: 'https://app.qaing.co',
    }),
  );
  await app.listen(8080, () => console.log('Nest.JS Server started on 8080'));
}
bootstrap();
