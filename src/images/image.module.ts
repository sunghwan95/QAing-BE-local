import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../models/users.model';
import { ShortVideo, ShortsVideoSchema } from '../models/shorts.model';
import { Image, ImageSchema } from '../models/image.model';
import { ConfigService } from '@nestjs/config';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ShortVideo.name, schema: ShortsVideoSchema },
      { name: Image.name, schema: ImageSchema },
    ]),
  ],
  controllers: [ImageController],
  providers: [ImageService, ConfigService, AuthService, JwtService],
  exports: [ImageService],
})
export class ImageModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('/images');
  }
}
