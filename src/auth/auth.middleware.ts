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
    const token = req.cookies['access-token']; // 쿠키에서 JWT 토큰 추출
    console.log('토큰 : ', token);
    if (!token) {
      return res.redirect('https://app.qaing.co/auth/signup');
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      // JWT 토큰 검증
      req.user = decoded; // 요청 객체에 사용자 정보 추가
    } catch (error) {
      console.error(error);
    }

    next();
  }
}
