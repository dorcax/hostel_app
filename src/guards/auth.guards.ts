import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor (private jwtService:JwtService){}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token =this.extractTokenCredential(request)
    if(!token){
        throw new UnauthorizedException("invalid token")
    }
    try {
        const payload =this.jwtService.verify(token)
        request.user =payload
    } catch (error) {
        throw new UnauthorizedException("invalid token")
    }
    return true;
   

  }
  private extractTokenCredential(request:Request):string|undefined{
    return request.headers.authorization?.split(" ")[1]
  }
}