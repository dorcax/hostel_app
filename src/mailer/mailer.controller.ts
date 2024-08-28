import { Controller,Post,Body ,Res} from '@nestjs/common';
import { MailerService } from './mailer.service';
import { sendEmailDto } from './dto/mailDto';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post("send")
  async sendMail(@Body() dto:sendEmailDto, @Res() res){
    
 try {
  const result=await this.mailerService.sendEmail(dto)
 return res.status(201).json(result)
 } catch (error) {
  res.status(400).json({message:"failed to send emailnow "})
 }
  }
}
