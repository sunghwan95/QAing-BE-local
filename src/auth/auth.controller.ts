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
      const accessToken = this.authService.generateJwtToken(req.user);
      const refreshToken = this.authService.generateRefreshToken();
      const sameSite = req.headers.host.includes('.qaing.co') ? 'None' : '';

      // 쿠키에 JWT 토큰 설정
      // httponly: true 떄문에 안되는 것 같음.
      // credential : true 안먹히는 이유를 찾아야 함.
      res.cookie('refresh-token', refreshToken, {
        sameSite,
        httpOnly: true,
        secure: true,
        domain: '.qaing.co',
      });

      res.cookie('access-token', accessToken, {
        sameSite,
        httpOnly: true,
        secure: true,
        domain: '.qaing.co',
      });
      // 쿠키에 accessToken 저장
      // 사용자 페이지로 리디렉션
      res.redirect('https://test.app.qaing.co/auth/google/callback');
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
      const sameSite = req.headers.host.includes('.qaing.co') ? 'None' : '';
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
        sameSite,
        httpOnly: true,
        secure: true,
        domain: '.qaing.co',
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
