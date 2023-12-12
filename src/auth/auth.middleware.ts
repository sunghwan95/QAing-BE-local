import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const accessToken = req.cookies['access-token'];
    const refreshToken = req.cookies['refresh-token'];

    if (!accessToken) {
      return res.redirect('https://app.qaing.co/auth/signup');
    }

    try {
      const accessTokenDecoded = this.jwtService.verify(accessToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // accessToken의 만료 기간이 지나지 않았다면, 현재 유저 정보를 요청 객체에 추가
      req.user = accessTokenDecoded;

      // 만료 기간 확인을 위해 refreshToken도 별도로 검증
      const refreshTokenDecoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // refreshToken이 만료 기간이 지났다면, 로그인 페이지로 리디렉션
      if (refreshTokenDecoded.exp <= Math.floor(Date.now() / 1000)) {
        return res.redirect('https://app.qaing.co/auth/signup');
      }

      // accessToken의 만료 기간이 지났다면, 새로운 accessToken 발급
      if (accessTokenDecoded.exp <= Math.floor(Date.now() / 1000)) {
        const sameSite = req.headers.host.includes('.qaing.co') ? true : false;
        console.log('디코딩된 토큰 : ', refreshTokenDecoded);
        const newAccessToken = this.jwtService.sign(
          {
            userId: refreshTokenDecoded.userId,
            email: refreshTokenDecoded.userEmail,
          },
          {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: '1h',
          },
        );

        res.cookie('access-token', newAccessToken, {
          sameSite,
          httpOnly: true,
          secure: true,
          domain: '.qaing.co',
        });
      }
    } catch (error) {
      console.error(error);
    }

    next();
  }
}
