import { Controller, Get, Param, Res, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiService } from './api/api.service';

@Controller('/')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly urlMappingService: ApiService,
  ) {}

  @Get()
  home() {
    return 'Local Server';
  }

  @Get(':hashedUrl')
  async getOriginalUrl(@Param('hashedUrl') hashedUrl: string, @Res() res) {
    const mapping = await this.urlMappingService.getOriginalUrl(hashedUrl);
    if (mapping) {
      // 원본 URL로 리디렉션
      res.redirect(HttpStatus.MOVED_PERMANENTLY, mapping.originUrl);
    } else {
      // URL을 찾을 수 없는 경우 404 응답
      res.status(HttpStatus.NOT_FOUND).json({ message: 'URL not found' });
    }
  }
}
