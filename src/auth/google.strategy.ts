import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://test.qaing.co/auth/google/callback',
      scope: ['email', 'profile'],
      accessType: 'offline',
      prompt: 'consent', // 실제 운영에서는 최초 로그인시에만 refresh-token을 발급해주기 위해 주석 처리 할 것.
    });
  }

  async validate(
    accessToken,
    refreshToken,
    profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { emails, displayName, photos } = profile;
    console.log('프로필 : ', profile);
    const user = {
      userEmail: emails[0].value,
      userName: displayName,
      userProfile: photos[0].value,
      accessToken,
      refreshToken,
    };
    const userInDB = await this.authService.findOrCreate(user);
    done(null, userInDB);
  }
}
