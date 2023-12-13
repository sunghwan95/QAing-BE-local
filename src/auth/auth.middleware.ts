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
    const sameSite = req.headers.host.includes('localhost') ? 'none' : 'lax';

    if (!accessToken && !refreshToken) {
      return res.redirect('http://localhost:3000/auth/signup');
    }

    try {
      if (accessToken) {
        this.jwtService.verify(accessToken, {
          secret: this.configService.get<string>('JWT_SECRET'),
        });
        req.user = this.jwtService.decode(accessToken);
      }
    } catch (error) {
      if (error.name === 'TokenExpiredError' && refreshToken) {
        // accessToken 만료 및 refreshToken 유효
        try {
          const newAccessToken =
            await this.authService.getNewAccessToken(refreshToken);
          res.cookie('access-token', newAccessToken, {
            domain: 'localhost',
          });
          req.user = this.jwtService.decode(newAccessToken);
        } catch (innerError) {
          console.error('Failed to refresh access token:', innerError);
          return res.redirect('http://localhost:3000/auth/signup');
        }
      } else {
        // 두 토큰 모두 무효
        return res.redirect('http://localhost:3000/auth/signup');
      }
    }

    next();
  }
}
