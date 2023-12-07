import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AppService } from 'src/app.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly appService: AppService) {}
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req: any, @Res() res: any) {
    const jwtToken = req.user; // Passport에서 반환한 JWT 토큰
    //console.log('쿠키 : ', jwtToken);
    //res.cookie('jwt', jwtToken); // 쿠키에 JWT 토큰 설정
    //res.setHeader('Authorization', jwtToken);
    //res.headers("Authorization", jwtToken)
    //console.log('응답 : ', res);
    res.redirect(`http://localhost:3000/auth/google/callback?jwt=${jwtToken}`); // 프론트엔드 리디렉션 URL
  }

  @Get('check')
  async check(@Req() req: any) {
    console.log('리퀘스트 : ', req);
  }
}
