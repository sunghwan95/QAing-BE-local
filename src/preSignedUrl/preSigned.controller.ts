import {
  Body,
  Controller,
  Delete,
  Post,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { PresignedService } from './preSigned.service';

@Controller('presignedurl')
export class PresignurlController {
  constructor(private presignedService: PresignedService) {}

  @Post()
  async createUploadUrl(
    @Body('filename') filename: string,
    @Body('type') type: string,
    @Body('isProfileImg') isProfileImg: boolean,
    @Res() res: any,
  ): Promise<{ url: string }> {
    try {
      if (!filename || !type) {
        return res.status(404).json({ message: '파일 받기 실패' });
      }
      const url = await this.presignedService.getUploadPresignedUrl(
        filename,
        type,
        isProfileImg,
      );
      return res.json({ url });
    } catch (error) {
      return res.status(504).json({ message: 'timeout' });
    }
  }

  // @Delete()
  // async createDeleteUrl(
  //   @Body('filename') filename: string,
  //   @Res() res: any,
  // ): Promise<{ url: string }> {
  //   const url = await this.presignedService.getDeletePresignedUrl(filename);
  //   return res.json({ url });
  // }

  @Post('/s3bucket')
  async fileUploadedUrl(
    @Req() req: any,
    @Res() res: any,
    @Body('filename') filename: string,
    @Body('isProfileImg') isProfileImg: boolean,
  ) {
    const userId = req.user._id;
    const fileUrl = this.presignedService.constructFileUrl(filename);
    if (isProfileImg) {
      await this.presignedService.updateUserFile(userId, fileUrl);
      return res.json({ message: 'success', fileUrl });
    } else {
      await this.presignedService.updateIssueFileImg(filename, fileUrl);
      return res.json({ message: 'success', fileUrl });
    }
  }
}
