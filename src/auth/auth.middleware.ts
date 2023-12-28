import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UserService } from 'src/users/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private authService: AuthService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies['access-token'];
    const refreshToken = req.cookies['refresh-token'];
    if (!accessToken && !refreshToken) {
      // 로그인을 하지 않은 상태
      return res.redirect('http://localhost:3000/auth/signup');
    }

    try {
      if (accessToken) {
        // accessToken 유효성 검증, 만약 만료기한 지났다면 catch문 진입
        const googleUserProfile =
          await this.authService.getGoogleUserProfile(accessToken);

        const user = await this.userService.findUserByEmail(
          googleUserProfile.email,
        );
        req.user = user;
        console.log('액세스 토큰 보유 유저 : ', req.user);
        return next();
      }
    } catch (error) {
      if (refreshToken) {
        try {
          // refreshToken 유효성 검증 및 새로운 accessToken 발급 시도
          // refreshToken 만료시 getNewAccessToken메소드에서 에러 출력 후 catch문 진입
          const newAccessToken =
            await this.authService.getNewAccessToken(refreshToken);
          res.cookie('access-token', newAccessToken, {
            domain: 'localhost',
          });

          const googleUserProfile =
            await this.authService.getGoogleUserProfile(newAccessToken);
          const user = await this.userService.findUserByEmail(
            googleUserProfile.email,
          );
          req.user = user;
          console.log('accesstoken 재발급 유저 : ', req.user);
          return next();
        } catch (innerError) {
          //refreshtoken 만료시 유저를 로그인 페이지로 리디렉션
          return res.redirect('http://localhost:3000/auth/signup');
        }
      }
    }
  }
}
