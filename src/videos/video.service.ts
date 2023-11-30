import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video } from 'src/models/videos.model';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(Video.name)
    private videoModel: Model<Video>,
  ) {}

  findAll(id: string): Promise<Video[]> {
    return this.videoModel.find().exec();
  }
}
