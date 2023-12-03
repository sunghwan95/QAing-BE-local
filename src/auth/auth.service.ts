import { Injectable } from '@nestjs/common/decorators';
import { JwtService } from '@nestjs/jwt/dist';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/models/users.model';
import { Model } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async setRefreshToken({ user, res }) {
    const refreshToken = this.jwtService.sign(
      {
        email: user.userEmail,
        sub: user.id,
      },
      { secret: process.env.REFRESH_TOKEN_SECRET_KEY, expiresIn: '2m' },
    );

    await this.userModel.findByIdAndUpdate(user.id, { refreshToken });

    // 응답이 이미 보내진 경우 추가적인 헤더를 설정하지 않음
    if (!res.headersSent) {
      //https로 변경할 경우 아래 코드로 변경
      //res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict`);
      res.setHeader('Set-Cookie', `refreshToken=${refreshToken}`);
      return;
    }
    return;
  }
}
