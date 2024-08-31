import { Injectable ,BadRequestException, ConflictException, UnauthorizedException} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client'
import * as bcrypt from "bcrypt";
import { OtpService } from '../otp/otp.service';
import { LoginDto } from './dto/loginDto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private prisma:PrismaService,
        private readonly otpService :OtpService,
        private readonly jwtService:JwtService
    ){}

    async createUser(signUpDto:Prisma.UserCreateInput,res){
  
        // check if email exist
      try {  
        const emailExist =await this.prisma.user.findUnique({
        where:{
            email:signUpDto.email
        }
    })
    if(emailExist){
        throw new ConflictException("Email already exists")
    }
    
    // hash passsword 
    const genSalt =await bcrypt.genSalt(10)
    const hashPassword =await bcrypt.hash(signUpDto.password,genSalt)
    // create new user
    const newUser =await this.prisma.user.create({
        data:{
            ...signUpDto,
            password:hashPassword
        }
    })
    const userId =newUser.id
     // send user otp to the user email
      await this.otpService.sendOtp(userId,res)
      console.log(newUser)
    return { message: "User registered"};
   
      } catch (error) {
        console.log(error)
        throw new BadRequestException("registration failed")
        
      }
        
         
        
    }




    // verify user
    async verifyUser(otpCode:string){

      try {
        const verifyOtp  = await this.otpService.verifyOtpCode(otpCode)
      console.log("otpuser",verifyOtp)
        const userExist =await this.prisma.user.update({
            where:{
                 id:verifyOtp.userId
            },
            data:{
                verified:true
            }
        })
        console.log(userExist)
        // delete otp after user have been verified
        await this.otpService.deleteOtp(verifyOtp.userId)
        console.log("OTP deleted for user:", verifyOtp.userId);
        return {message:"user email has been verified successfully"}

      } catch (error) {
        throw new BadRequestException("failed to verify the otp")
      }
    }



    // resendverification otp
    async resendOtp(email:string,res){
     try {
      const user=await this.prisma.user.findUnique({
        where:{
          email
        },
        // include: { otp: true },
  
      })
       if(!user) {
      throw new UnauthorizedException('Invalid details');
    }
    console.log("welcome",user)
      
    const  existingOtp =await this.prisma.otp.findFirst({
      where:{
        userId:user.id
      }
    })
  
    if( new Date() < new Date(existingOtp.expiry)){

      return {
        message: 'OTP code is still valid, please use the existing code',
      };
    }else{
        await this.otpService.deleteOtp(existingOtp.id)
      // return{ message:"otp expired"}
    }
  
       // Send new OTP
     console.log("Sending new OTP...");
     await this.otpService.sendOtp(user.id, res);
     console.log("OTP sent successfully.");

      return {
       message: 'A new OTP has been sent to your email',
     };
    
     } 
    catch (error) {
      console.log(error)

      return res.status(500).json({
        message: 'An error occurred while resending OTP',
      });
     }

  
}




    // login user 

    async login(body:LoginDto){
      try {
        const{email,password} =body
        // find user
        const user =await this.prisma.user.findUnique({
            where:{
                email:email
            }

        })
        if(!user){
            throw new UnauthorizedException("invalid credential")
        }
        if(!user.verified){
            throw new BadRequestException("Account not verified ,please verify account")

        }

        const isMatch =await bcrypt.compare(password,user.password)
        if(!isMatch){
            throw new UnauthorizedException("invalid credentials")
        }



        await this.generateToken(user.id)
        return ({message:"user logged in "})
      } catch (error) {
        
      }
    }


    async generateToken(userId:number){
     try {
      const token =this.jwtService.sign({id:userId},{secret:process.env.JWT_SECRET,expiresIn:"2d"})
      return token
     } catch (error) {
      throw new Error("Failed to generate token")
      
     }
    }
  }