import { Controller,Post,Body ,Res,Req, BadRequestException, UseGuards, UnauthorizedException} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateSignUpDto } from '../auth/dto/CreateSignUpDto';
import { OtpService } from '../otp/otp.service';
import { LoginDto } from './dto/loginDto';
import { resendVerificationDto } from '../otp/dto/resendVerificationDto';
import { VerifyOtpDto } from '../otp/dto/verifyDto';



@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly otpService:OtpService
  ) {}

  // todo post signup
  @Post("signup")
  async signUp(@Body() signUpDto:CreateSignUpDto,@Res() res){
       try {
        const result =await this.authService.createUser(signUpDto,res)
       res.json(result)
       } catch (error) {
        res.status(400).json({ message: error.message });
       }
  }


  // verify otp
  @Post("verify-otp")
  async verifyOtp(@Body() body:VerifyOtpDto,@Req() req,@Res() res){
  try {
    const {otpCode} = body
   
    const result =await this.authService.verifyUser(otpCode)
    res.json(result); 
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
      

  }

  // resend verification code 
  @Post("resendverificationcode")
  async resendVerification(@Body() body:resendVerificationDto, @Req() req,@Res() res){
    const{email}=body
    const result=await this.authService.resendOtp(email,res)
    res.json(result)
   }

  // user login

@Post("login")
async loginUser(@Body() body:LoginDto, @Res() res){
  const user = await this.authService.login(body)
   res.json(user)

}
}
