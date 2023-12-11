import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Req,
  Res,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { User } from 'src/models/users.model';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import * as express from '@nestjs/platform-express';
import { Multer } from 'multer';
import { InjectModel, getModelToken } from '@nestjs/mongoose';
import { parse } from 'path';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { Folder } from 'src/models/folders.model';

@Controller('videos')
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
    @Inject(getModelToken(User.name)) private readonly userModel: Model<User>,
    @Inject(getModelToken(Folder.name))
    private readonly folderModel: Model<Folder>,
  ) {}

  @Get('process')
  @UseInterceptors(FileInterceptor('webmFile'))
  async createFolder(@Req() req: any, @Res() res: any): Promise<void> {
    const userId = req.user.userId;
    const folder = await this.videoService.getFolderIdByUser(userId);
    return res.json({ folderId: folder._id, status: folder.status });
  }

  @Put('process/:folderId')
  @UseInterceptors(FileInterceptor('webmFile'))
  async processVideoAndImages(
    @UploadedFile() webmFile: Express.Multer.File,
    @Body('timestamps') timestamps: string,
    @Param('folderId') folderId: string,
    @Req() req: any,
    @Res() res: any,
  ): Promise<void> {
    const parsedTimestamps = JSON.parse(timestamps);
    console.log('녹화 중인 유저 : ', req.user);
    const userId = req.user.userId;
    await this.videoService.processVideoAndImages(
      webmFile,
      parsedTimestamps,
      userId,
      folderId,
    );
    return res.json({ message: 'success' });
  }
}
