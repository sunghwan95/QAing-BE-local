import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { Video, VideoSchema } from '../models/videos.model';
import { User, UserSchema } from '../models/users.model';
import { ShortVideo, ShortsVideoSchema } from '../models/shorts.model';
import { Image, ImageSchema } from '../models/image.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Video.name, schema: VideoSchema },
      { name: User.name, schema: UserSchema },
      { name: ShortVideo.name, schema: ShortsVideoSchema },
      { name: Image.name, schema: ImageSchema },
    ]),
  ],
  controllers: [VideoController],
  providers: [VideoService],
  exports: [VideoService],
})
export class VideoModule {}
