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
      callbackURL: 'http://localhost:8080/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  authorizationParams(): { [key: string]: string } {
    return {
      access_type: 'offline',
      prompt: 'consent',
    };
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
    console.log('리프레시 토큰 : ', user.refreshToken);
    const userInDB = await this.authService.findOrCreate(user);
    done(null, userInDB);
  }
}
