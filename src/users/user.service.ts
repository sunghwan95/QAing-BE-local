import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../models/users.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

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

  async getByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ userEmail: email }).exec();

    if (user) {
      return user;
    }
    throw new HttpException('존재하지 않는 유저입니다.', HttpStatus.NOT_FOUND);
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
