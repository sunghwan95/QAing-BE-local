import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService, // AuthService는 사용자 검증 및 토큰 갱신 등을 처리하는 서비스입니다.
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies;

    if (!token) {
      // 토큰이 없을 경우, 로그인이 필요한 상태로 처리
      return res.status(401).json({ message: 'Unauthorized - Login required' });
    }

    try {
      // 토큰이 있는 경우, 토큰을 검증하여 사용자를 인증
      const decoded = jwt.verify(
        token,
        this.configService.get('JWT_SECRET'),
      ) as any;

      // accessToken이 유효하고 일치하는 경우, 사용자 정보를 request 객체에 저장하고 다음 미들웨어로 진행
      req.user = decoded;
      return next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        // accessToken이 만료된 경우, refreshToken을 사용하여 새로운 accessToken 발급
        const refreshToken = req.cookies['refreshToken'];

        if (!refreshToken) {
          // refreshToken이 없는 경우 에러 내뱉고 로그인으로 유도
          return res
            .status(401)
            .json({ message: 'Unauthorized - Login required' });
        }

        try {
          // refreshToken을 사용하여 새로운 accessToken 발급
          const newAccessToken =
            await this.authService.refreshAccessToken(refreshToken);

          // 새로운 accessToken을 쿠키에 저장
          res.cookie('jwt', newAccessToken, { httpOnly: true });

          // 사용자 정보를 request 객체에 저장하고 다음 미들웨어로 진행
          req.user = jwt.verify(
            newAccessToken,
            this.configService.get('JWT_SECRET'),
          ) as any;
          return next();
        } catch (error) {
          // refreshToken이 유효하지 않은 경우, 로그인이 필요한 상태로 처리
          return res
            .status(401)
            .json({ message: 'Unauthorized - Invalid refreshToken' });
        }
      }

      // 그 외의 에러 처리
      return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
  }
}
