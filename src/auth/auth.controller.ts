import { GoogleOAuthGuard } from 'src/guards/google-auth.guard';
import { Controller, Get, Request, Response, UseGuards } from '@nestjs/common';
import { AppService } from 'src/app.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly appService: AppService) {}

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Request() req) {}

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect(@Request() req, @Response() res) {
    return this.appService.googleLogin(req, res);
  }
}
