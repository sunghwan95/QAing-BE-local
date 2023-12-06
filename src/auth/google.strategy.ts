import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://test.qaing.co/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const { displayName, emails, photos } = profile;
      const user = {
        userEmail: emails[0].value,
        userName: displayName,
        picture: photos[0].value,
        accessToken,
        refreshToken,
      };

      done(null, user);
    } catch (err) {
      console.log('에러', err);
      return;
    }
  }
}
