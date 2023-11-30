import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from '../models/users.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  exports: [UserService], //userService 다른곳에서 사용할수 있도록 exports
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
