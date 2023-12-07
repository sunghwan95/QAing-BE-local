import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('/')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index.ejs')
  homepage() {
    return {
      dog: "/    \n^<br> )  ( ')<br>(  /  )<br> (__)|<br><br>고양이",
    };
  }
}
