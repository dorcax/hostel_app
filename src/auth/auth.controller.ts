import { Controller,Post,Body ,Res,Req, BadRequestException, UseGuards, UnauthorizedException} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateSignUpDto } from '../auth/dto/CreateSignUpDto';
import { OtpService } from '../otp/otp.service';
import { otpDto } from '../otp/dto/otpDto';
import { LoginDto } from './dto/loginDto';
import { resendVerificationDto } from './dto/resendVerificationDto';
import { AuthGuard } from '../guards/auth.guards';



@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly otpService:OtpService
  ) {}

  // todo post signup
  @Post("signup")
  async signUp(@Body() signUpDto:CreateSignUpDto,@Res() res){
       return this.authService.createUser(signUpDto,res)
  }


  // verify otp
  @UseGuards(AuthGuard)
  @Post("verify-otp")
  async verifyOtp(@Body() body:otpDto,@Req() req,@Res() res){
    const {otpCode} =body
    const user =req.user.id
    if (!user) {
      throw new BadRequestException('User ID not found');
    }
    const otpIsValid =await this.otpService.verifyOtpCode(otpCode,user)
    if(!otpIsValid){
      throw new BadRequestException("invalid otp")
    }
    // user marked as verify
     const verifiedUser=await this.authService.verifyUser(user)
      return res.status(200).json({message:"user verified successfully"})

  }

  // resend verification code 
  @UseGuards(AuthGuard)
  @Post("resendverificationcode")
  async resendVerification(@Body() body:resendVerificationDto, @Req() req,@Res() res){
    const{email}=body
    const userId=req.user.id
    // check for user

    const user =await this.authService.getUser(userId)
    if(!user) {
      throw new UnauthorizedException('Invalid details');
    }
    const Otp=await this.otpService.getOtp(userId)
    if(Otp && new Date()< Otp.expiry){

      return res.status(400).json({
        message: 'OTP code is still valid, please use the existing code',
      });
    }
    if(Otp){
      return await this.otpService.deleteOtp(userId)
    }
      
    
     
   
   const sendOtp= await this.otpService.sendOtp(userId,res)
   return res.status(200).json({
    message: 'New OTP sent successfully',
  });

  }

  // user login
@UseGuards(AuthGuard)
@Post("login")
async loginUser(@Body() body:LoginDto, @Res() res){
  const user = this.authService.login(body)
  return res.status(200).json({message:"user logged in"})

}
}
