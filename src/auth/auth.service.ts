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
      { secret: process.env.REFRESH_TOKEN_SECRET_KEY, expiresIn: '2w' },
    );

    await this.userModel.findByIdAndUpdate(user.id, { refreshToken });

    res.setHeader('Set-Cookie', `refreshToken=${refreshToken}`);
    return;
  }
}
