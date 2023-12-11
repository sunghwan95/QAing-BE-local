import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      const token = request.cookies['access-token'];
      if (!token) {
        return false;
      }
      const decoded = this.jwtService.verify(token);
      request.user = decoded;
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
