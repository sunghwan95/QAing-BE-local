import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IssueFile } from 'src/models/issueFiles.model';
import { Folder } from 'src/models/folders.model';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import { User } from 'src/models/users.model';

const execAsync = promisify(exec);

@Injectable()
export class VideoService {
  private s3Client: S3Client;

  constructor(
    @InjectModel(IssueFile.name)
    private issueFileModel: Model<IssueFile>,
    @InjectModel(Folder.name)
    private folderModel: Model<Folder>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly configService: ConfigService,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_S3_SECRET_ACCESS_KEY'),
      },
    });
  }

  async processVideoAndImages(
    webmFile: Express.Multer.File,
    timestamps: number[],
    userId: string,
  ): Promise<{ videoUrls: string[]; imageUrls: string[] }> {
    const videoUrls: string[] = [];
    const imageUrls: string[] = [];

    const timestampNow = Date.now();
    const tempWebmFilePath = path.join(__dirname, `${timestampNow}_temp.webm`);

    await this.writeTemporaryFile(webmFile.buffer, tempWebmFilePath);

    if (timestamps.length === 0) {
      console.log('타임 스탬프 배열 비어있음.');
      return;
    }

    try {
      const user = await this.userModel.findById(userId);

      const nowDate = new Date();

      const folder = new this.folderModel({
        folderName: `${nowDate.getFullYear()}-${
          nowDate.getMonth() + 1
        }-${nowDate.getDate()} ${
          nowDate.getHours() + 9
        }:${nowDate.getMinutes()}`,
        issues: [],
      });

      let issueNum: number;
      issueNum = 1;
      for (const timestamp of timestamps) {
        const imagePath = path.join(
          __dirname,
          `image_${timestampNow}_${timestamp}.jpg`,
        );
        const videoPath = path.join(
          __dirname,
          `video_${timestampNow}_${timestamp}.mp4`,
        );

        console.log('이미지 생성 시작');
        const imageUrl = await this.processImage(
          tempWebmFilePath,
          timestamp,
          imagePath,
        );
        console.log('이미지 생성 완료');

        console.log('비디오 생성 시작');
        const videoUrl = await this.processVideo(
          tempWebmFilePath,
          timestamp,
          videoPath,
        );
        console.log('비디오 생성 완료');

        imageUrls.push(imageUrl);
        videoUrls.push(videoUrl);

        const createdIssueFile = await this.saveMediaUrlsToMongoDB(
          imageUrl,
          videoUrl,
          issueNum,
        );
        issueNum += 1;
        folder.issues.push(createdIssueFile._id);
      }

      await folder.save();
      user.folders.push(folder._id);
      await user.save();
      console.log('이미지 및 비디오 생성 완료');
    } catch (err) {
      console.log('비디오 생성 중 에러 발생 : ', err);
      return;
    } finally {
      await this.deleteFile(tempWebmFilePath);
    }

    return { videoUrls, imageUrls };
  }

  private async writeTemporaryFile(
    buffer: Buffer,
    filePath: string,
  ): Promise<void> {
    try {
      await fs.promises.writeFile(filePath, buffer, { flag: 'w' });
    } catch (error) {
      console.error('임시 파일 쓰기 에러:', error);
      throw error;
    }
  }

  private async processImage(
    webmFilePath: string,
    timestamp: number,
    outputPath: string,
  ): Promise<string> {
    const command = `ffmpeg -ss ${timestamp} -i ${webmFilePath} -vframes 1 -q:v 2 ${outputPath}`;
    try {
      await execAsync(command);

      return this.uploadToS3(outputPath, 'image');
    } catch (error) {
      console.error('이미지 생성 중 오류 발생:', error);
      throw error;
    }
  }

  private async processVideo(
    webmFilePath: string,
    timestamp: number,
    outputPath: string,
  ): Promise<string> {
    const editStartTime = Math.max(0, timestamp - 10);
    const duration = 20;

    try {
      console.log('mp4 변환 시작');
      await this.convertWebMToMp4(
        webmFilePath,
        outputPath,
        editStartTime,
        duration,
      );
      console.log('mp4 변환 완료');
      return this.uploadToS3(outputPath, 'video');
    } catch (error) {
      console.error('비디오 생성 중 오류 발생:', error);
      throw error;
    }
  }

  private async convertWebMToMp4(
    inputPath: string,
    outputPath: string,
    startTime: number,
    duration: number,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(startTime)
        .duration(duration)
        .videoBitrate('600k')
        .size('1920x1080')
        .fps(30)
        .output(outputPath)
        .on('end', resolve)
        .on('error', (error) => {
          console.error('WebM to MP4 변환 중 오류:', error);
          reject(error);
        })
        .run();
    });
  }

  private async uploadToS3(
    filePath: string,
    fileType: 'image' | 'video',
  ): Promise<string> {
    const key = `${fileType}_${Date.now()}.${
      fileType === 'image' ? 'jpg' : 'mp4'
    }`;
    const fileStream = fs.createReadStream(filePath);
    const uploadParams = {
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: key,
      Body: fileStream,
    };

    try {
      await this.s3Client.send(new PutObjectCommand(uploadParams));
      const fileUrl = `https://${this.configService.get(
        'AWS_S3_BUCKET',
      )}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`;
      console.log(`S3에 ${fileType} 업로드 및 URL 생성 완료: ${fileUrl}`);
      return fileUrl;
    } catch (error) {
      console.error(`S3에 ${fileType} 업로드 중 오류 발생:`, error);
      throw error;
    } finally {
      await this.deleteFile(filePath);
    }
  }

  async saveMediaUrlsToMongoDB(
    imageUrl: string,
    videoUrl: string,
    issueNum: number,
  ) {
    try {
      const newIssueFile = new this.issueFileModel({
        issueName: `이슈 ${issueNum}`,
        imageUrl,
        videoUrl,
      });

      await newIssueFile.save();

      return newIssueFile;
    } catch (error) {
      console.error('MongoDB에 데이터 저장 중 오류 발생:', error);
      throw error;
    }
  }

  private async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      console.error('파일 삭제 중 오류 발생:', error);
    }
  }
}
