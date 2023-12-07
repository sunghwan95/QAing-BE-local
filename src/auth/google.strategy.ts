import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: 'https://test.qaing.co/auth/google/callback',
      passReqToCallback: true,
      scope: ['email', 'profile'],
    });
  }
  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    // 구글로부터 받은 사용자 정보를 가지고 유저를 찾거나 생성하는 등의 작업을 수행
    const user = await this.authService.findOrCreate(profile);

    // 사용자 정보를 토대로 JWT 토큰을 생성
    const jwtToken = this.authService.generateJwtToken(user);

    // JWT 토큰을 리턴
    return done(null, jwtToken);
  }
}
