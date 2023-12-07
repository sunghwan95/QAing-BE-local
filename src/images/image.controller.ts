import {
  Controller,
  Get,
  Delete,
  Param,
  Inject,
  Res,
  Req,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from 'src/models/users.model';
import { Image } from 'src/models/image.model';
import { getModelToken } from '@nestjs/mongoose';
import { ImageService } from './image.service';

@Controller('images')
export class ImageController {
  constructor(
    private readonly imageService: ImageService,
    @Inject(getModelToken(User.name)) private readonly userModel: Model<User>,
  ) {}

  @Get()
  async getAllImages(@Req() req: any, @Res() res: any): Promise<Image[]> {
    try {
      const { id } = req.user;
      const user = await this.userModel.findOne({ _id: id }).exec();

      if (!user) {
        console.log('해당 유저가 존재하지 않음.');
        return [];
      }

      const userImages: Image[] = user.images;

      return res.json(userImages);
    } catch (err) {
      console.error('에러 발생', err);
      throw err;
    }
  }

  @Get(':imageId')
  async getImageById(
    @Req() req: any,
    @Res() res: any,
    @Param('imageId') imageId: string,
  ): Promise<Image> {
    try {
      const { id } = req.user;
      const user = await this.userModel.findOne({ _id: id }).exec();

      if (!user) {
        console.log('해당 유저가 존재하지 않음.');
        return null;
      }

      const requestedImage: Image = user.images.find(
        (image) => image._id.toString() === imageId,
      );

      if (!requestedImage) {
        console.log('해당 이미지를 찾을 수 없음.');
        return null;
      }

      return res.json(requestedImage);
    } catch (err) {
      console.error('에러 발생', err);
      throw err;
    }
  }

  @Delete(':imageId')
  async deleteVideoById(
    @Req() req: any,
    @Res() res: any,
    @Param('imageId') imageId: string,
  ): Promise<{ message: string }> {
    try {
      const { id } = req.user;
      const user = await this.userModel.findOne({ _id: id }).exec();

      if (!user) {
        console.log('해당 유저가 존재하지 않음.');
        return { message: '사용자를 찾을 수 없습니다.' };
      }

      const requestedImageIndex = user.images.findIndex(
        (image) => image._id.toString() === imageId,
      );

      if (requestedImageIndex === -1) {
        console.log('해당 비디오를 찾을 수 없음.');
        return { message: '비디오를 찾을 수 없습니다.' };
      }
      user.shorts.splice(requestedImageIndex, 1);
      await user.save();

      return res.json({ message: 'success' });
    } catch (err) {
      console.error('에러 발생', err);
      throw err;
    }
  }
}
