import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from './auth/google.strategy';
import { AuthController } from './auth/auth.controller';
import { UserModule } from './users/user.module';
import { UserController } from './users/user.controller';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/users.model';
import { RootMiddleware } from './middleware/root-middleware';
import { VideoModule } from './videos/video.module';
import { VideoService } from './videos/video.service';
import { VideoController } from './videos/video.controller';
import { Video, VideoSchema } from './models/videos.model';
import { ShortVideo, ShortsVideoSchema } from './models/shorts.model';
import { Image, ImageSchema } from './models/image.model';
import { S3StorageModule } from './s3Storage/s3Storage.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Video.name, schema: VideoSchema },
      { name: User.name, schema: UserSchema },
      { name: ShortVideo.name, schema: ShortsVideoSchema },
      { name: Image.name, schema: ImageSchema },
    ]),
    UserModule,
    JwtModule,
    VideoModule,
    S3StorageModule,
  ],
  controllers: [AppController, AuthController, UserController, VideoController],
  providers: [AppService, GoogleStrategy, AuthService, VideoService],
})
export class AppModule {}
