import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video } from 'src/models/videos.model';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import * as ffprobe from 'ffprobe';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(Video.name)
    private videoModel: Model<Video>,
  ) {}

  findAll(id: string): Promise<Video[]> {
    return this.videoModel.find().exec();
  }

  async processVideoAndImages(
    webmFile: Express.Multer.File,
    timestamps: number[],
  ): Promise<{ videoPath: string; imagePaths: string[] }> {
    console.log('파일', webmFile);
    console.log('타임 레코드', timestamps);
    for (const t of timestamps) {
      console.log('레코드 타입', typeof t);
    }

    const outputVideoPath = path.join(process.cwd(), 'output.mp4');
    const tempWebmFilePath = path.join(process.cwd(), 'temp.webm');
    try {
      console.log('11111');
      await fs.promises.writeFile(tempWebmFilePath, webmFile.buffer, {
        flag: 'w',
      });
      console.log('22222');
    } catch (error) {
      console.error('Error writing temp webm file:', error);
      throw error;
    }

    console.log('33333');
    await this.convertWebmToMp4(tempWebmFilePath, outputVideoPath);
    console.log('44444');
    const totalDuration = await this.getVideoDuration(outputVideoPath);
    const floorDuration = Math.floor(totalDuration);
    console.log('반올림 시간: ', floorDuration);

    try {
      await fs.promises.unlink(tempWebmFilePath);
    } catch (error) {
      console.error('Error deleting temp webm file:', error);
    }

    const video = new this.videoModel({
      shortVideos: ['shortVideoId1', 'shortVideoId2'],
    });
    await video.save();

    const outputImages: string[] = [];
    for (const timestamp of timestamps) {
      const outputPathImage = path.join(__dirname, `image_${timestamp}.jpg`);
      const outputPathShortVideo = path.join(
        __dirname,
        `shortVideo_${timestamp}.mp4`,
      );
      await this.generateImageAndShortVideo(
        outputVideoPath,
        timestamp,
        outputPathImage,
        outputPathShortVideo,
      );
      outputImages.push(outputPathImage);
    }

    return { videoPath: outputVideoPath, imagePaths: outputImages };
  }

  private async getVideoDuration(videoPath: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          // 메타데이터에서 재생시간을 추출합니다.
          const durationInSeconds = metadata.format.duration;
          resolve(durationInSeconds);
        }
      });
    });
  }

  private async convertWebmToMp4(
    webmFilePath: string,
    outputPath: string,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(webmFilePath)
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  }

  private async generateImageAndShortVideo(
    videoPath: string,
    timestamp: number,
    outputPathImage: string,
    outputPathShortVideo: string,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const startTime = Math.max(0, timestamp - 10); // 시작 시간은 타임스탬프 기준으로 10초 전이 되도록
      const duration = 20; // 10초 앞뒤로 총 20초 동안의 영상을 생성하도록

      ffmpeg()
        .input(videoPath)
        .seekInput(startTime)
        .output(outputPathImage)
        .screenshots({
          count: 1,
          timemarks: [timestamp], // 타임스탬프에서만 캡처
          folder: path.dirname(outputPathImage),
          filename: path.basename(outputPathImage),
        })
        .output(outputPathShortVideo)
        .duration(duration)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  }
}
