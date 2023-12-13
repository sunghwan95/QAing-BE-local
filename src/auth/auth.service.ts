//auth.service.ts
import { Injectable } from '@nestjs/common/decorators';
import { JwtService } from '@nestjs/jwt/dist';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/models/users.model';
import { Model } from 'mongoose';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly configService: ConfigService,
  ) {}

  async findOrCreate(profile: any): Promise<User> {
    const userEmail = profile.userEmail; // 여기에 사용자의 이메일 또는 다른 식별 정보를 넣어야 합니다.
    let user = await this.userModel.findOne({ userEmail });

    if (!user) {
      user = await this.userModel.create({
        userEmail: userEmail,
        userName: profile.userName,
        userProfile: profile.userProfile,
        userPhoneNumber: null,
        userJob: null,
        userTeamsize: null,
        userCompany: null,
        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken,
      });
    } else {
      user.refreshToken = profile.refreshToken;
    }
    await user.save();
    console.log('로그인한 유저 : ', user);
    return user;
  }

  generateJwtToken(user: User): string {
    const payload = { userId: user._id, email: user.userEmail };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '1h',
    });
  }

  async getNewAccessToken(refreshToken: string): Promise<string> {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });
    return response.data.access_token;
  }
}
