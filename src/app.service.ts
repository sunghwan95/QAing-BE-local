import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  googleLogin(req: any) {
    const { user } = req;

    if (!user) {
      return '존재하지 않는 유저';
    }

    return user;
  }
}
