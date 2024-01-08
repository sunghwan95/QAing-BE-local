import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IssueFile } from 'src/models/issueFiles.model';
import { Folder } from 'src/models/folders.model';
import * as fs from 'fs';
import * as path from 'path';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import { User } from 'src/models/users.model';
import * as crypto from 'crypto';
import { Image } from 'src/models/images.model';
import { Video } from 'src/models/videos.model';

const execAsync = promisify(exec);
//테스트 커밋
@Injectable()
export class VideoService {
  private s3Client: S3Client;
  private folderUpdateSubscribers: Map<string, Function[]> = new Map();

  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Folder.name)
    private folderModel: Model<Folder>,
    @InjectModel(IssueFile.name)
    private issueFileModel: Model<IssueFile>,
    @InjectModel(Image.name)
    private imageModel: Model<Image>,
    @InjectModel(Video.name)
    private videoModel: Model<Video>,
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

  private formatToTwoDigits(number: number): string {
    return number.toString().padStart(2, '0');
  }

  async getFolderIdByUser(userId: string) {
    try {
      const user = await this.userModel.findById(userId);
      console.log('user : ', user);
      const now = new Date();

      // KST 시간으로 변환합니다. (UTC+9)
      const kstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);

      const folderName = `${kstDate.getUTCFullYear()}-${this.formatToTwoDigits(
        kstDate.getUTCMonth() + 1,
      )}-${this.formatToTwoDigits(
        kstDate.getUTCDate(),
      )} ${this.formatToTwoDigits(
        kstDate.getUTCHours(),
      )}:${this.formatToTwoDigits(kstDate.getUTCMinutes())}`;

      const folder = new this.folderModel({
        folderName,
        issues: [],
        status: false,
        totalTasks: 0,
        owner: user,
      });

      await folder.save();

      user.folders.push(folder._id);
      await user.save();

      return folder;
    } catch (error) {
      throw error;
    }
  }

  async processVideoAndImages(
    webmFile: Express.Multer.File,
    timestamps: number[],
    folderId: string,
  ) {
    const tempWebmFilePath = path.join(__dirname, `${folderId}_temp.webm`);

    await this.writeTemporaryFile(webmFile.buffer, tempWebmFilePath);
    if (timestamps.length === 0) return;

    const folder = await this.folderModel.findById(folderId);
    const totalTasks = timestamps.length;

    let completedTasks: number = 0;
    let issueNum: number = 1;

    this.notifyFolderProgress(folderId, completedTasks, totalTasks);

    try {
      try {
        for (const timestamp of timestamps) {
          const hashedImageName = `${this.hashString(
            `image_${folderId}_${issueNum}`,
          )}.png`;
          const hashedVideoName = `${this.hashString(
            `video_${folderId}_${issueNum}`,
          )}.mp4`;

          const imageUrl = await this.processMedia(
            tempWebmFilePath,
            timestamp,
            hashedImageName,
            'image',
          );
          const videoUrl = await this.processMedia(
            tempWebmFilePath,
            timestamp,
            hashedVideoName,
            'video',
          );
          const createdIssueFile = await this.saveMediaUrlsToMongoDB(
            imageUrl,
            videoUrl,
            issueNum,
            folder._id,
            timestamp,
          );
          folder.issues.push(createdIssueFile._id);

          completedTasks++;
          this.notifyFolderProgress(folderId, completedTasks, totalTasks);
          issueNum++;
        }
      } catch (error) {
        throw error;
      }

      if (folder.issues.length == totalTasks) {
        folder.status = true;
        this.notifyFolderUpdate(folderId, folder);
      } else {
        throw new Error('이슈 생성 중 에러 발생.');
      }

      folder.totalTasks = totalTasks;
      folder.completedTasks = completedTasks;

      await folder.save();
    } catch (err) {
      return;
    } finally {
      await this.deleteFile(tempWebmFilePath);
      return;
    }
  }

  private async writeTemporaryFile(
    buffer: Buffer,
    filePath: string,
  ): Promise<void> {
    try {
      await fs.promises.writeFile(filePath, buffer, { flag: 'w' });
    } catch (error) {
      throw error;
    }
  }

  private async getVideoDuration(filePath: string): Promise<number> {
    try {
      const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
      const { stdout } = await execAsync(command);
      return parseFloat(stdout.trim());
    } catch (error) {
      console.error('Error getting video duration:', error);
      throw error;
    }
  }

  private async processMedia(
    webmFilePath: string,
    timestamp: number,
    hashedFileName: string,
    mediaType: 'image' | 'video',
  ): Promise<string> {
    let totalVideoLength: number;
    if (mediaType == 'video') {
      totalVideoLength = await this.getVideoDuration(webmFilePath);
    }
    const outputPath = path.join(__dirname, hashedFileName);
    const command =
      mediaType === 'image'
        ? `ffmpeg -ss ${timestamp} -i ${webmFilePath} -vframes 1 -q:v 2 ${outputPath}`
        : `ffmpeg -ss ${
            timestamp - 10 < 0 ? 0 : timestamp - 10
          } -i ${webmFilePath} -t ${
            timestamp + 10 > totalVideoLength
              ? totalVideoLength
              : timestamp + 10
          } -c:v libx264 -preset superfast -b:v 600k -r 30 -c:a aac ${outputPath}
      `;

    try {
      await execAsync(command);
      await this.uploadToS3(outputPath, hashedFileName); // 해시된 파일명을 전달
      return `https://static.qaing.co/${hashedFileName}`;
    } catch (error) {
      console.error(`${mediaType} 생성 중 오류 발생:`, error);
      throw error;
    }
  }

  async deleteFromS3(hashedFileName: string): Promise<void> {
    const deleteParams = {
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: hashedFileName,
    };

    try {
      await this.s3Client.send(new DeleteObjectCommand(deleteParams));
      return;
    } catch (error) {
      console.error(`Error in deleting file ${hashedFileName} from S3:`, error);
      throw error;
    }
  }

  private async uploadToS3(
    filePath: string,
    hashedFileName: string,
  ): Promise<string> {
    let contentType: string;
    let extension = hashedFileName.split('.').pop();

    switch (extension) {
      case 'jpg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'mp4':
        contentType = 'video/mp4';
        break;
      default:
        contentType = 'application/octet-stream';
        break;
    }

    const fileStream = await fs.createReadStream(filePath);
    const uploadParams = {
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: hashedFileName,
      Body: fileStream,
      ContentDisposition: 'inline',
      ContentType: contentType,
    };

    try {
      await this.s3Client.send(new PutObjectCommand(uploadParams));
      const fileUrl = `https://${this.configService.get(
        'AWS_S3_BUCKET',
      )}.s3.${this.configService.get(
        'AWS_REGION',
      )}.amazonaws.com/${hashedFileName}`;
      return fileUrl;
    } catch (error) {
      console.error(`S3에 파일 업로드 중 오류 발생:`, error);
      throw error;
    }
  }

  async saveMediaUrlsToMongoDB(
    imageUrl: string,
    videoUrl: string,
    issueNum: number,
    folderId: string,
    timestamp: number,
  ) {
    try {
      const folder = await this.folderModel
        .findById(folderId)
        .populate(['issues', 'owner']);

      const newIssueFile = new this.issueFileModel({
        issueName: `이슈 ${issueNum}`,
        images: [],
        video: null,
        parentFolder: folder._id,
        owner: folder.owner,
      });

      await newIssueFile.save();

      const imageFile = new this.imageModel({
        originImageUrl: imageUrl,
        editedImageUrl: null,
        timestamp,
        parentIssueFile: newIssueFile._id,
        owner: folder.owner,
      });

      const videoFile = new this.videoModel({
        originVideoUrl: videoUrl,
        editedVideoUrl: null,
        parentIssueFile: newIssueFile._id,
        owner: folder.owner,
      });

      await imageFile.save();
      await videoFile.save();

      newIssueFile.images.push(imageFile._id);
      newIssueFile.video = videoFile._id;
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

  private hashString(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex');
  }

  subscribeToFolderUpdates(folderId: string, callback: Function) {
    if (!this.folderUpdateSubscribers.has(folderId)) {
      this.folderUpdateSubscribers.set(folderId, []);
    }
    this.folderUpdateSubscribers.get(folderId).push(callback);
  }

  private notifyFolderUpdate(folderId: string, folder: Folder) {
    const subscribers = this.folderUpdateSubscribers.get(folderId);
    if (subscribers) {
      subscribers.forEach((callback) => callback(folder));
    }
  }

  private notifyFolderProgress(
    folderId: string,
    progress: number,
    totalTasks: number,
  ) {
    const subscribers = this.folderUpdateSubscribers.get(folderId);
    if (subscribers) {
      subscribers.forEach((callback) => callback({ progress, totalTasks }));
    }
  }
}
