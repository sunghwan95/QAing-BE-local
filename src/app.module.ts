import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './auth/google.strategy';
import { AuthController } from './auth/auth.controller';
import { UserModule } from './users/user.module';
import { UserController } from './users/user.controller';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/users.model';
import { VideoModule } from './videos/video.module';
import { VideoService } from './videos/video.service';
import { VideoController } from './videos/video.controller';
import { ShortVideo, ShortsVideoSchema } from './models/shorts.model';
import { Image, ImageSchema } from './models/image.model';
import { S3StorageModule } from './s3Storage/s3Storage.module';
import { ImageModule } from './images/image.module';
import { ImageController } from './images/image.controller';
import { ImageService } from './images/image.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({
      secret: process.env.JWT_SECRET, // 여기에 사용할 JWT 비밀 키를 설정
      signOptions: { expiresIn: '1h' },
    }),
    DatabaseModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ShortVideo.name, schema: ShortsVideoSchema },
      { name: Image.name, schema: ImageSchema },
    ]),
    UserModule,
    VideoModule,
    S3StorageModule,
    ImageModule,
    AuthModule,
  ],
  controllers: [
    AppController,
    AuthController,
    UserController,
    VideoController,
    ImageController,
  ],
  providers: [
    AppService,
    GoogleStrategy,
    AuthService,
    VideoService,
    ImageService,
    ConfigService,
  ],
})
export class AppModule {}
