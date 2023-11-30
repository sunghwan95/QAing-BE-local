import { GoogleOAuthGuard } from 'src/guards/google-auth.guard';
import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AppService } from 'src/app.service';

@Controller('auth')
export class GoogleController {
  constructor(private readonly appService: AppService) {}

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Request() req) {}

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect(@Request() req) {
    return this.appService.googleLogin(req);
  }
}
