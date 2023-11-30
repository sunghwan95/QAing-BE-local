import {
  Controller,
  Get,
  Post,
  Param,
  Request,
  Response,
} from '@nestjs/common';
import { Video } from 'src/models/videos.model';
import { Model } from 'mongoose';
import { User } from 'src/models/users.model';

@Controller('videos')
export class VideoController {
  constructor(private readonly userModel: Model<User>) {}

  @Get()
  async getAllVideos(@Request() req): Promise<Video[]> {
    try {
      const { id } = req.user;
      const user = await this.userModel.findOne({ _id: id }).exec();

      if (!user) {
        console.log('해당 유저가 존재하지 않음.');
        return [];
      }

      const userVideos: Video[] = user.videos;

      return userVideos;
    } catch (err) {
      console.error('에러 발생', err);
      throw err;
    }
  }
}
