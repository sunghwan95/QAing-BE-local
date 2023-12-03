import { Injectable } from '@nestjs/common';
import { UserService } from './users/user.service';
import { AuthService } from './auth/auth.service';

@Injectable()
export class AppService {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async googleLogin(req: any, res: any) {
    const { user } = req;
    console.log('리퀘스트 유저 : ', user);
    console.log('리퀘스트 유저 이메일:', user.userEmail);
    let findUser = await this.userService.getByEmail(user.userEmail);

    if (!findUser) {
      const createdUser = {
        userEmail: user.userEmail,
        userName: user.userName,
        userPhoneNumber: null,
        userJob: null,
        userTeamSize: null,
        userCompany: null,
        accessToken: user.accessToken,
      };

      findUser = await this.userService.create(createdUser);
    }

    this.authService.setRefreshToken({ user: findUser, res });
    return res.json(findUser);
  }
}
