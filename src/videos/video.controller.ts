import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Request,
  Body,
  UseInterceptors,
  UploadedFile,
  Inject,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { User } from 'src/models/users.model';
import { ShortVideo } from 'src/models/shorts.model';
import { Image } from 'src/models/image.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import * as express from '@nestjs/platform-express';
import { Multer } from 'multer';
import { InjectModel, getModelToken } from '@nestjs/mongoose';
import { parse } from 'path';

@Controller('videos')
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
    @Inject(getModelToken(User.name)) private readonly userModel: Model<User>,
  ) {}

  @Get()
  async getAllShorts(@Request() req): Promise<ShortVideo[]> {
    try {
      const { id } = req.user;
      const user = await this.userModel.findOne({ _id: id }).exec();

      if (!user) {
        console.log('해당 유저가 존재하지 않음.');
        return [];
      }

      const userShorts: ShortVideo[] = user.shorts;

      return userShorts;
    } catch (err) {
      console.error('에러 발생', err);
      throw err;
    }
  }

  @Get(':videoId')
  async getShortsById(
    @Request() req,
    @Param('videoId') videoId: string,
  ): Promise<ShortVideo> {
    try {
      const { id } = req.user;
      const user = await this.userModel.findOne({ _id: id }).exec();

      if (!user) {
        console.log('해당 유저가 존재하지 않음.');
        return null;
      }

      const requestedVideo: ShortVideo = user.shorts.find(
        (video) => video._id.toString() === videoId,
      );

      if (!requestedVideo) {
        console.log('해당 비디오를 찾을 수 없음.');
        return null;
      }

      return requestedVideo;
    } catch (err) {
      console.error('에러 발생', err);
      throw err;
    }
  }

  @Delete(':videoId')
  async deleteVideoById(
    @Request() req,
    @Param('videoId') videoId: string,
  ): Promise<{ message: string }> {
    try {
      const { id } = req.user;
      const user = await this.userModel.findOne({ _id: id }).exec();

      if (!user) {
        console.log('해당 유저가 존재하지 않음.');
        return { message: '사용자를 찾을 수 없습니다.' };
      }

      const requestedVideoIndex = user.shorts.findIndex(
        (video) => video._id.toString() === videoId,
      );

      if (requestedVideoIndex === -1) {
        console.log('해당 비디오를 찾을 수 없음.');
        return { message: '비디오를 찾을 수 없습니다.' };
      }
      user.shorts.splice(requestedVideoIndex, 1);
      await user.save();

      return { message: 'success' };
    } catch (err) {
      console.error('에러 발생', err);
      throw err;
    }
  }

  @Post('process')
  @UseInterceptors(FileInterceptor('webmFile'))
  async processVideoAndImages(
    @UploadedFile() webmFile: Express.Multer.File,
    @Body('timestamps') timestamps: string,
  ): Promise<{ videoUrls: string[]; imageUrls: string[] }> {
    const parsedTimestamps = JSON.parse(timestamps);
    console.log(parsedTimestamps);
    return this.videoService.processVideoAndImages(webmFile, parsedTimestamps);
  }
}
