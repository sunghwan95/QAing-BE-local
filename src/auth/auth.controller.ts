import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AppService } from 'src/app.service';
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
      const accessToken = this.authService.generateJwtToken(user);
      const refreshToken = user.refreshToken; // Google로부터 받은 refreshToken 사용
      console.log('리퀘스트 헤더 : ', req.headers.host);
      const sameSite = req.headers.host.includes('localhost') ? 'None' : '';

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

  @Get('refresh')
  async refreshAccessToken(@Req() req, @Res() res) {
    try {
      const sameSite = req.headers.host.includes('localhost') ? 'None' : '';
      const refreshToken = req.cookies['refresh-token'];
      if (!refreshToken) {
        throw new Error('Refresh token not provided');
      }

      const decoded = this.jwtService.verify(
        refreshToken,
        this.configService.get('JWT_SECRET'),
      ) as any;

      const partialUser: Partial<User> = {
        _id: decoded.userId,
        userEmail: decoded.email,
      };

      const user = partialUser as User;

      const accessToken = this.authService.generateJwtToken(user);

      res.cookie('access-token', accessToken, {
        domain: 'localhost',
      });

      res.status(HttpStatus.OK).json({ success: true, accessToken });
    } catch (error) {
      console.error('Token refresh failed:', error);
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: 'Invalid refresh token' });
    }
  }
}
