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

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Google 로그인 페이지로 리디렉션
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req, @Res() res) {
    const accessToken = this.authService.generateJwtToken(req.user);
    const sameSite = req.headers.host.includes('.qaing.co') ? 'None' : '';

    // 쿠키에 JWT 토큰 설정
    // httponly: true 떄문에 안되는 것 같음.
    // credential : true 안먹히는 이유를 찾아야 함.
    res.cookie('access-token', accessToken, {
      sameSite,
      httpOnly: true,
      secure: true,
      domain: '.qaing.co',
    });
    // 쿠키에 accessToken 저장
    // 사용자 페이지로 리디렉션
    res.redirect('https://app.qaing.co/auth/google/callback');
  }
}
