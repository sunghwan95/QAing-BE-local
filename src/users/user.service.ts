import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../models/users.model';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    try {
      const newUser = await this.userModel.create(userData);
      return newUser;
    } catch (error) {
      console.log('유저생성시 에러 발생', error);
    }
  }

  findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  findOne(id: string): Promise<User | null> {
    try {
      const findUser = this.userModel.findOne({ _id: id }).exec();
      return findUser;
    } catch (err) {
      console.log('해당 유저가 존재하지 않음.', err);
      return;
    }
  }

  async remove(id: string): Promise<void> {
    await this.userModel.deleteOne({ _id: id }).exec();
  }

  async getByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.userModel.findOne({ userEmail: email }).exec();
      console.log('이메일로 찾은 유저 : ', user);

      if (user !== null) {
        return user;
      } else {
        return null;
      }
    } catch (error) {
      console.error('이메일 조회 중 에러 발생', error);
      throw new HttpException(
        '이메일 조회 중 에러 발생',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getById(id: string): Promise<User> {
    const user = await this.userModel.findOne({ _id: id }).exec();
    if (user) {
      return user;
    }

    throw new HttpException(
      '해당 ID가 존재하지 않습니다.',
      HttpStatus.NOT_FOUND,
    );
  }
}
