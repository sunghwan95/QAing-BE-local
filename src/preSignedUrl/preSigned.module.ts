import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PresignedController } from './preSigned.controller';
import { PresignedService } from './preSigned.service';

@Module({
  imports: [],
  controllers: [PresignedController],
  providers: [ConfigService, PresignedService], // 서비스 추가
  exports: [],
})
export class PreSingedModule {}
