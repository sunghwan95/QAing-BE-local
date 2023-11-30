import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from './auth/google.strategy';
import { GoogleController } from './auth/google.controller';
import { UserModule } from './users/user.module';
import { UserController } from './users/user.controller';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule, UserModule],
  controllers: [AppController, GoogleController, UserController],
  providers: [AppService, GoogleStrategy],
})
export class AppModule {}
