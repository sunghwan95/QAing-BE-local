//auth.service.ts
import { Injectable } from '@nestjs/common/decorators';
import { JwtService } from '@nestjs/jwt/dist';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/models/users.model';
import { Model } from 'mongoose';
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
      });
    }
    console.log('로그인한 유저 : ', user);
    return user;
  }

  generateJwtToken(user: User): string {
    const payload = { userId: user._id, email: user.userEmail };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '2m',
    });
  }

  // async refreshAccessToken(refreshToken: string): Promise<string> {
  //   try {
  //     // refreshToken이 유효한지 검증
  //     const decoded = jwt.verify(
  //       refreshToken,
  //       this.configService.get('JWT_SECRET'),
  //     ) as any;

  //     // 이 시점에서 decoded에는 사용자 정보가 담겨 있음
  //     // 새로운 accessToken을 생성하고 반환
  //     const newAccessToken = jwt.sign(
  //       { sub: decoded.sub, email: decoded.email }, // 사용자 정보
  //       this.configService.get('JWT_SECRET'),
  //       { expiresIn: '2m' }, // accessToken 만료 시간
  //     );

  //     return newAccessToken;
  //   } catch (error) {
  //     // refreshToken이 유효하지 않은 경우 또는 기타 에러 처리
  //     throw new Error('Invalid refreshToken');
  //   }
  // }
  async validateUser(token: string): Promise<any> {
    return this.jwtService.verify(token);
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
