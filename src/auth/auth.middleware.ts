import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private authService: AuthService,
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

      req.user = accessTokenDecoded;

      if (
        accessTokenDecoded.exp <= Math.floor(Date.now() / 1000) &&
        refreshToken
      ) {
        const newAccessToken =
          await this.authService.getNewAccessToken(refreshToken);
        res.cookie('access-token', newAccessToken, {
          httpOnly: true,
          secure: true,
          domain: '.qaing.co',
        });
      }
    } catch (error) {
      console.error(error);
      return res.redirect('https://app.qaing.co/auth/signup');
    }

    next();
  }
}
