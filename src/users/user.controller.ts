import { Controller, Get, Param, Delete, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../models/users.model';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  //모든 유저 목록 조회
  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  //특정 유저 조회
  @Get(':userId')
  findOne(@Param('userId') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  //특정 유저 삭제
  @Delete(':userId')
  async remove(@Param('userId') id: string): Promise<void> {
    await this.userService.remove(id);
  }
}
