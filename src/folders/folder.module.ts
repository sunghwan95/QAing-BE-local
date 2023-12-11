import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../models/users.model';
import { IssueFile, IssueFileSchema } from 'src/models/issueFiles.model';
import { ConfigService } from '@nestjs/config';
import { FoldersController } from './folder.controller';
import { FolderService } from './folder.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AuthMiddleware } from 'src/auth/auth.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: IssueFile.name, schema: IssueFileSchema },
    ]),
  ],
  controllers: [FoldersController],
  providers: [FolderService, ConfigService, AuthService, JwtService],
  exports: [FolderService],
})
export class ImageModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('/folders');
  }
}
