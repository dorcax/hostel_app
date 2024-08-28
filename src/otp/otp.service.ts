import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { otpDto } from './dto/otpDto';
import { MailerService } from '../mailer/mailer.service';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { Address } from 'nodemailer/lib/mailer';
import * as bcrypt from "bcrypt"
@Injectable()
export class OtpService {
    constructor(private readonly mailerService:MailerService,
        private  prisma:PrismaService,
        private readonly configService:ConfigService
    ){}
    // create otp and sed email

    async sendOtp ( userId:number,res){
       
        try {
            
            const deleteExistingOtp =await this.prisma.otp.deleteMany({
                where:{
                    userId
                }
             })   

            //  generate new otp code
            const generateNewOtp = await this.generateOtp()
      
            // find if user exist 
            const user =await this.prisma.user.findUnique({
                where:{
                    id:userId
                }
            })
            if(!user){
                throw new NotFoundException("user not found")
            }


            // send email to the user
        
        //  const recipient: Address ={address:user.email} as Address
        // try {
            const Otpmailresult =await this.mailerService.sendEmail({
                from: {
                    name:this.configService.get<string>("APP_NAME"),
                    address:this.configService.get<string>("DEFAULT_EMAIL")
    
                },
                recipients:{
                    name:user.name,
                    address:user.email
                },
                subject: 'verify your email',
                html: `<p>Enter  <strong>${generateNewOtp}</strong> in the app to verify your email address </p>`,
            })
        //   res.json({
        //     status:"PENDING",
        //     message:"verification otp email sent"

        // })
        // } catch (error) {
        //     throw new BadRequestException("Failed to send OTP email");
        // }
        
        //   save the otp record
        const hashedOtp =await this.hashOtp(generateNewOtp)
        const newOtp =await this.prisma.otp.create({
            data:{
                otpCode: hashedOtp,
                createdAt:new Date(),
                expiry:new Date(Date.now()+3600000),
                user:{
                    connect:{
                        id:userId
                    }
                }


            }
        })
        return { message: 'OTP sent to email' };


        } catch (error) {
            throw new BadRequestException("Failed to send OTP");
        }


    }
// generate pin to be send

private generateOtp():string{
  try {
    const otp =Math.floor(Math.random()*9000)+1000
    return otp.toString()
  } catch (error) {
    throw new BadRequestException("failed in creating a new otp")
    
  }

}
      
    // hashed otp

 private async hashOtp(otpCode:string):Promise<string>{
    try {
        const hashedOtp =await bcrypt.hash(otpCode,10)
        return hashedOtp;
    } catch (error) {
        throw new BadRequestException('Failed to hash OTP');
    }

    }

    // verify otp

     async verifyOtpCode(otpCode:string,user:number):Promise<boolean>{
        try {
    // get the otp assgned to the user
    
    const otpResult =await this.prisma.otp.findUnique({
        where:{
            id:user
        }
    })
    // check if the otp result doesnot exist
     if(!otpResult){
        throw new BadRequestException("OTP not found")
     }
    //  check if otp have expired

    if(new Date() >otpResult.expiry){
        await this.prisma.otp.deleteMany({
            where:{
                id:user

            }
        })
        throw new BadRequestException("OTP has expired .please request again")
    }

    // verify the otp code
    const otpIsValid =await bcrypt.compare(otpCode,otpResult.otpCode)
    if(!otpIsValid){
        throw new BadRequestException("invalid otp")
    }
    
    return otpIsValid;

        } catch (error) {
            console.log(error)
            throw new BadRequestException('Failed to verify OTP');  
        }
    }


    // find otp

    async getOtp(userId:number){
        const getOtp=await this.prisma.otp.findUnique({
            where:{
                id:userId
            }
        })
        return getOtp
    }

    async deleteOtp(userId:number){
        const deleteOtp =await this.prisma.otp.deleteMany({
            where:{
                id:userId
            }
        }) 
    } 
}
