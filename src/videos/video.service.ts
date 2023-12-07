import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShortVideo } from 'src/models/shorts.model';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Image } from 'src/models/image.model';
import * as ffprobe from 'ffprobe';
import * as ffprobeStat from 'ffprobe-static';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(ShortVideo.name)
    private shortVideoModel: Model<ShortVideo>,
    @InjectModel(Image.name)
    private imageModel: Model<Image>,
    private readonly configService: ConfigService,
  ) {}

  findAll(id: string): Promise<ShortVideo[]> {
    return this.shortVideoModel.find().exec();
  }

  async processVideoAndImages(
    webmFile: Express.Multer.File,
    timestamps: number[],
  ): Promise<{ videoUrls: string[]; imageUrls: string[] }> {
    const videoUrls: string[] = [];
    const imageUrls: string[] = [];
    console.log('파일 : ', webmFile);
    console.log('타임 스탬프 : ', timestamps);

    const tempWebmFilePath = path.join(__dirname, `${Date.now()}_temp.webm`);
    try {
      await fs.promises.writeFile(tempWebmFilePath, webmFile.buffer, {
        flag: 'w',
      });
    } catch (error) {
      console.error('임시 파일 쓰기 에러 발생 : ', error);
      throw error;
    }
    console.log('임시 파일 경로에 webm 덮어 씌우기 완료');

    if (timestamps.length === 0) {
      console.log('타임 스탬프 배열 비어있음.');
      return;
    } else {
      await Promise.all(
        timestamps.map(async (timestamp) => {
          console.log('ts 요소 : ', timestamp);
          const outputPathImage = path.join(
            __dirname,
            '../images',
            `image_${timestamp}.png`,
          );
          const outputPathShortVideo = path.join(
            __dirname,
            `shortVideo_${timestamp}.webm`,
          );

          // 이미지 및 비디오 생성 및 S3 업로드
          const [imageUrl, videoUrl] = await Promise.all([
            this.generateImage(tempWebmFilePath, timestamp, outputPathImage),
            this.generateShortVideo(
              tempWebmFilePath,
              timestamp,
              outputPathShortVideo,
            ),
          ]);

          imageUrls.push(imageUrl);
          videoUrls.push(videoUrl);

          await this.saveImageAndVideoUrlsToMongoDB(imageUrl, videoUrl);
        }),
      );
    }

    console.log('이미지와 비디오 생성 및 MongoDB에 저장 완료');

    try {
      await fs.promises.unlink(tempWebmFilePath);
      console.log('임시 파일 삭제 완료');
    } catch (error) {
      console.error('Error deleting temp webm file:', error);
    }

    return { videoUrls, imageUrls };
  }

  private async generateImage(
    webmFilePath: string,
    timestamp: number,
    outputPathImage: string,
  ): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      console.log('이미지 생성 시작');
      console.log('이미지 저장 경로 : ', outputPathImage);
      //const startTime = Math.max(0, timestamp - 10);

      ffmpeg()
        .input(webmFilePath)
        .seekInput(timestamp)
        .output(outputPathImage)
        .screenshots({
          count: 1,
          timemarks: [timestamp],
          folder: path.dirname(outputPathImage),
          filename: path.basename(outputPathImage),
        })
        .on('end', async () => {
          const imageUrl = await this.uploadToS3(
            outputPathImage,
            timestamp,
            'image',
          );
          console.log('이미지 생성 및 S3 업로드 완료');
          resolve(imageUrl);
        })
        .on('error', (err) => {
          console.error('이미지 생성 중 오류 발생 :\n', err);
          reject(err);
        })
        .run();
    });
  }

  private async generateShortVideo(
    webmFilePath: string,
    timestamp: number,
    outputPathShortVideo: string,
  ): Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      console.log('비디오 생성 시작');
      console.log('동영상 저장 경로 : ', outputPathShortVideo);

      const totalDuration = await this.getVideoDuration(webmFilePath);
      let startTime: number;
      let duration: number;

      // 1. 타임스탬프 기준 앞뒤 10초가 전체 영상범위 안에 들 경우 -> 그대로 20초 영상 생성
      if (timestamp - 10 >= 0 && timestamp + 10 <= totalDuration) {
        startTime = timestamp - 10;
        duration = totalDuration;
      }
      // 2. 타임스탬프 기준 앞 10초가 0보다 작고 뒤 10초가 전체 영상길이보다 짧을 때 -> 0초~뒤 10초 까지의 시간까지만 영상 생성
      else if (timestamp - 10 < 0 && timestamp + 10 <= totalDuration) {
        startTime = 0;
        duration = timestamp + 10;
      }
      // 3. 타임스탬프 기준 앞 10초가 0보다 크고 뒤 10초가 전체 영상길이보다 클 때 -> 앞 10초 ~ 끝까지의 시간까지만 영상 생성
      else if (timestamp - 10 >= 0 && timestamp + 10 >= totalDuration) {
        startTime = timestamp - 10;
        duration = totalDuration - timestamp + 10;
      }
      // 4. 타임스탬프 기준 앞 10초가 0보다 작고 뒤 10초가 전체 영상길이보다 클 때 -> 그냥 원본 영상 저장
      else {
        startTime = 0;
        duration = totalDuration;
      }

      ffmpeg()
        .input(webmFilePath)
        .seekInput(startTime)
        .output(outputPathShortVideo)
        .duration(duration)
        .on('end', async () => {
          const videoUrl = await this.uploadToS3(
            outputPathShortVideo,
            timestamp,
            'video',
          );
          console.log('비디오 생성 및 S3 업로드 완료');
          resolve(videoUrl);
        })
        .on('error', (err) => {
          console.error('비디오 생성 중 오류 발생 :\n', err);
          reject(err);
        })
        .run();
    });
  }

  private async uploadToS3(
    filePath: string,
    timestamp: number,
    type: 'image' | 'video',
  ): Promise<string> {
    const s3 = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_S3_SECRET_ACCESS_KEY'),
      },
    });

    const key = `${type}_${timestamp}.${type === 'image' ? 'png' : 'webm'}`;

    const fileStream = fs.createReadStream(filePath);

    const uploadParams = {
      Bucket: 's3-qaing-test',
      Key: key,
      Body: fileStream,
    };

    try {
      await s3.send(new PutObjectCommand(uploadParams));
      const fileUrl = `https://s3-qaing-test.s3.ap-northeast-2.amazonaws.com/${key}`;
      console.log(`S3에 ${type} 업로드 및 URL 생성 완료: ${fileUrl}`);
      return fileUrl;
    } catch (error) {
      console.error(`S3에 ${type} 업로드 중 오류 발생:`, error);
      throw error;
    }
  }

  private async saveImageAndVideoUrlsToMongoDB(
    imageUrl: string,
    videoUrl: string,
  ): Promise<void> {
    console.log('MongoDB에 이미지 URL 및 비디오 URL 저장 시작');
    // 여기에 MongoDB에 저장하는 로직 추가
    // 예: req.user.image = imageUrl; req.user.video = videoUrl;
    console.log('MongoDB에 이미지 URL 및 비디오 URL 저장 완료');
  }

  private async getVideoDuration(filePath: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      ffprobe(filePath, { path: ffprobeStat.path }, (err, info) => {
        if (err) {
          reject(err);
        } else {
          const duration =
            info.format && info.format.duration
              ? parseFloat(info.format.duration)
              : 0;
          resolve(duration);
        }
      });
    });
  }
}
