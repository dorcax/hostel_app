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

    async createUser(signUpDto:Prisma.UserCreateInput,res): Promise<{ message: string; token: string }>{
        // check if email exist
      try {  const emailExist =await this.prisma.user.findUnique({
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
     // send user otp to the user email
    const otpResponse= await this.otpService.sendOtp(newUser.id,res)
    const token= this.jwtService.sign({id:newUser.id},{expiresIn:"3h"})
    console.log(token)

    // return  { message: 'User registered, OTP sent to email',token }
    return {
        message: `User registered, ${otpResponse.message}`,
        token
    };
   
      } catch (error) {
        console.log(error)
        throw new BadRequestException("registration failed")
        
      }
        
         
        
    }




    // verify user
    async verifyUser(userId:number){
        // find user
      try {
        const userExist =await this.prisma.user.update({
            where:{
                 id:userId
            },
            data:{
                verified:true
            }
        })
        await this.otpService.deleteOtp(userId)
        return {message:"user email has been verified successfully"}

      } catch (error) {
        throw new BadRequestException("failed to delete the otp")
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

        return ({message:"user logged in "})
      } catch (error) {
        
      }
    }

    // find user
    async getUser(userId:number){
      try {
        const user =await this.prisma.user.findUnique({
            where:{
                id:userId
            }
        })

        return user
      } catch (error) {
        throw new BadRequestException("user not found")
      }
    }
}
