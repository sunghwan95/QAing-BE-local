import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/models/users.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Google 로그인 페이지로 리디렉션
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req, @Res() res) {
    try {
      const user = req.user as User;

      // `accessToken`은 생성하지만, `refreshToken`은 Google로부터 받은 것을 사용
      const accessToken = user.accessToken;
      const refreshToken = user.refreshToken; // Google로부터 받은 refreshToken 사용

      // 쿠키에 토큰 설정
      res.cookie('refresh-token', refreshToken, {
        domain: 'localhost',
      });

      res.cookie('access-token', accessToken, {
        domain: 'localhost',
      });

      res.redirect('http://localhost:3000/auth/google/callback');
    } catch (err) {
      console.error('Google authentication failed:', err);
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: 'Google authentication failed' });
    }
  }
}
