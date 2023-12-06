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
import { Video } from 'src/models/videos.model';
import { Model, Types } from 'mongoose';
import { User } from 'src/models/users.model';
import { ShortVideo } from 'src/models/shorts.model';
import { Image } from 'src/models/image.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import * as express from '@nestjs/platform-express';
import { Multer } from 'multer';
import { InjectModel, getModelToken } from '@nestjs/mongoose';

@Controller('videos')
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
    @Inject(getModelToken(Video.name))
    private readonly videoModel: Model<Video>,
    @Inject(getModelToken(User.name)) private readonly userModel: Model<User>,
    @Inject(getModelToken(ShortVideo.name))
    private readonly shortVideoModel: Model<ShortVideo>,
    @Inject(getModelToken(Image.name))
    private readonly imageModel: Model<Image>,
  ) {}

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

  @Get(':videoId')
  async getOriginVideo(
    @Request() req,
    @Param('videoId') videoId: string,
  ): Promise<Video> {
    try {
      const { id } = req.user;
      const user = await this.userModel.findOne({ _id: id }).exec();

      if (!user) {
        console.log('해당 유저가 존재하지 않음.');
        return null;
      }

      const requestedVideo: Video = user.videos.find(
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

      const requestedVideoIndex = user.videos.findIndex(
        (video) => video._id.toString() === videoId,
      );

      if (requestedVideoIndex === -1) {
        console.log('해당 비디오를 찾을 수 없음.');
        return { message: '비디오를 찾을 수 없습니다.' };
      }
      user.videos.splice(requestedVideoIndex, 1);
      await user.save();

      return { message: '비디오가 성공적으로 삭제되었습니다.' };
    } catch (err) {
      console.error('에러 발생', err);
      throw err;
    }
  }

  @Get(':videoId/shorts')
  async getShortVideosByVideoId(
    @Request() req,
    @Param('videoId') videoId: string,
  ): Promise<ShortVideo[]> {
    try {
      const { id } = req.user;
      const user = await this.userModel.findOne({ _id: id }).exec();

      if (!user) {
        console.log('해당 유저를 찾을 수 없음.');
        return null;
      }

      const video = user.videos.find(
        (userVideo) => userVideo._id.toString() === videoId,
      );

      if (!video) {
        console.log('해당 비디오를 찾을 수 없음.');
        return null;
      }

      const shortVideos: ShortVideo[] = await this.shortVideoModel
        .find({
          _id: { $in: video.shortVideos.map((id) => new Types.ObjectId(id)) },
        })
        .exec();

      return shortVideos;
    } catch (err) {
      console.error('에러 발생', err);
      throw err;
    }
  }

  @Get(':videoId/shorts/:shortsId')
  async getShortVideoById(
    @Request() req,
    @Param('videoId') videoId: string,
    @Param('shortsId') shortsId: string,
  ): Promise<ShortVideo> {
    try {
      const { id } = req.user;
      const user = await this.userModel.findOne({ _id: id }).exec();

      if (!user) {
        console.log('해당 유저를 찾을 수 없음.');
        return null;
      }

      const video = user.videos.find(
        (userVideo) => userVideo._id.toString() === videoId,
      );

      if (!video) {
        console.log('해당 비디오를 찾을 수 없음.');
        return null;
      }

      const shortVideo: ShortVideo = await this.shortVideoModel
        .findOne({
          _id: new Types.ObjectId(shortsId),
          video: new Types.ObjectId(videoId),
        })
        .exec();

      if (!shortVideo) {
        console.log('해당 숏츠를 찾을 수 없음.');
        return null;
      }

      return shortVideo;
    } catch (err) {
      console.error('에러 발생', err);
      throw err;
    }
  }

  @Delete(':videoId/shorts/:shortsId')
  async deleteShortVideoById(
    @Request() req,
    @Param('videoId') videoId: string,
    @Param('shortsId') shortsId: string,
  ): Promise<{ message: string }> {
    try {
      const { id } = req.user;
      const user = await this.userModel.findOne({ _id: id }).exec();

      if (!user) {
        console.log('해당 유저를 찾을 수 없음.');
        return { message: '유저를 찾을 수 없습니다.' };
      }

      const video = user.videos.find(
        (userVideo) => userVideo._id.toString() === videoId,
      );

      if (!video) {
        console.log('해당 비디오를 찾을 수 없음.');
        return { message: '비디오를 찾을 수 없습니다.' };
      }

      const deletedShortVideo = await this.shortVideoModel
        .findOneAndDelete({
          _id: new Types.ObjectId(shortsId),
          video: new Types.ObjectId(videoId),
        })
        .exec();

      if (!deletedShortVideo) {
        console.log('해당 숏츠를 찾을 수 없음.');
        return { message: '삭제할 숏츠를 찾을 수 없습니다.' };
      }

      return { message: '숏츠가 성공적으로 삭제되었습니다.' };
    } catch (err) {
      console.error('에러 발생', err);
      throw err;
    }
  }

  @Get(':videoId/images')
  async getImagesByVideoId(
    @Request() req,
    @Param('videoId') videoId: string,
  ): Promise<Image[]> {
    try {
      const { id } = req.user;
      const user = await this.userModel.findOne({ _id: id }).exec();

      if (!user) {
        console.log('해당 유저를 찾을 수 없음.');
        return null;
      }

      const video = user.videos.find(
        (userVideo) => userVideo._id.toString() === videoId,
      );

      if (!video) {
        console.log('해당 비디오를 찾을 수 없음.');
        return null;
      }

      const images: Image[] = await this.imageModel
        .find({
          _id: { $in: video.images.map((id) => new Types.ObjectId(id)) },
        })
        .exec();

      return images;
    } catch (err) {
      console.error('에러 발생', err);
      throw err;
    }
  }

  @Get(':videoId/images/:imageId')
  async getImageById(
    @Request() req,
    @Param('videoId') videoId: string,
    @Param('imageId') imageId: string,
  ): Promise<Image> {
    try {
      const { id } = req.user;
      const user = await this.userModel.findOne({ _id: id }).exec();

      if (!user) {
        console.log('해당 유저를 찾을 수 없음.');
        return null;
      }

      const video = user.videos.find(
        (userVideo) => userVideo._id.toString() === videoId,
      );

      if (!video) {
        console.log('해당 비디오를 찾을 수 없음.');
        return null;
      }

      const image: Image = await this.imageModel
        .findOne({
          _id: new Types.ObjectId(imageId),
          _iamge: new Types.ObjectId(imageId),
        })
        .exec();

      if (!image) {
        console.log('해당 이미지를 찾을 수 없음.');
        return null;
      }

      return image;
    } catch (err) {
      console.error('에러 발생', err);
      throw err;
    }
  }

  @Delete(':videoId/images/:imageId')
  async deleteImageById(
    @Request() req,
    @Param('videoId') videoId: string,
    @Param('imageId') imageId: string,
  ): Promise<{ message: string }> {
    try {
      const { id } = req.user;
      const user = await this.userModel.findOne({ _id: id }).exec();

      if (!user) {
        console.log('해당 유저를 찾을 수 없음.');
        return { message: '유저를 찾을 수 없습니다.' };
      }

      const video = user.videos.find(
        (userVideo) => userVideo._id.toString() === videoId,
      );

      if (!video) {
        console.log('해당 비디오를 찾을 수 없음.');
        return { message: '비디오를 찾을 수 없습니다.' };
      }

      const deletedImage = await this.imageModel
        .findOneAndDelete({
          _id: new Types.ObjectId(imageId),
          video: new Types.ObjectId(videoId),
        })
        .exec();

      if (!deletedImage) {
        console.log('해당 이미지를 찾을 수 없음.');
        return { message: '삭제할 이미지를 찾을 수 없습니다.' };
      }

      return { message: '이미지가 성공적으로 삭제되었습니다.' };
    } catch (err) {
      console.error('에러 발생', err);
      throw err;
    }
  }

  @Post('process')
  @UseInterceptors(FileInterceptor('webmFile')) //blob으로 바꾸기
  async processVideoAndImages(
    @UploadedFile() webmFile: Express.Multer.File,
    // @Body('timestamps') timestamps: number[],
    @Body('timeRecords') timerecords: number[],
  ): Promise<{ videoPath: string; imagePaths: string[] }> {
    return this.videoService.processVideoAndImages(webmFile, timerecords);
  }
}
