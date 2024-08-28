import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { OtpService } from './otp.service';
import { otpDto } from './dto/otpDto';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}
  
  @Post("sendOtp")
  async createOtp(@Body() body:otpDto,@Req()req, @Res() res){
    const userId =req.user
    return this.otpService.sendOtp(userId,res)
  }
}
