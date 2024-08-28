import { BadRequestException, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from "@nestjs/config";
import { sendEmailDto } from './dto/mailDto';

@Injectable()
export class MailerService {
      constructor(private readonly configService:ConfigService ){}
  // object of the mail transport
     mailTransport(){  
        const transporter =nodemailer.createTransport({
          service:"gmail",
          host:this.configService.get<string>("MAIL_HOST"),
          port:this.configService.get<number>("MAIL_PORT"),
          secure:true,
          auth:{
            user:this.configService.get<string>("MAIL_USER"),
            pass:this.configService.get<string>("MAIL_PASSWORD")

          },
          tls: {
            rejectUnauthorized: false, // This allows self-signed certificates
          },
        })
        return transporter
    }

    // Method for sending  out the details
    async sendEmail(dto:sendEmailDto){
      const {from,recipients,html,placeholderReplacement,subject} =dto
      const transport =this.mailTransport()
      const options={
        from :from ??{

          name: this.configService.get<string>("APP_NAME"),
          address:this.configService.get<string>("DEFAULT_EMAIL")
        },
        to:recipients,
        subject,
        html,
        placeholderReplacement

      }
      try {
        const result =await transport.sendMail(options)
        return { message: 'Email sent successfully', result };
        // return result
      } catch (error) {
        console.log("email sending erroro:",error)
        throw new BadRequestException("failed to send email")
      }
        
    }

}
