import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShortVideo } from 'src/models/shorts.model';
import { ConfigService } from '@nestjs/config';
import { Image } from 'src/models/image.model';

@Injectable()
export class ImageService {
  constructor(
    @InjectModel(Image.name)
    private imageModel: Model<Image>,
    private readonly configService: ConfigService,
  ) {}

  findAll(id: string): Promise<Image[]> {
    return this.imageModel.find().exec();
  }
}
