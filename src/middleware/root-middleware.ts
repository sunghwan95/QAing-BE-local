import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RootMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 모든 루트 요청에 대해 상태 코드 200을 설정
    if (req.url === '/') {
      res.status(200);
    }
    next();
  }
}
