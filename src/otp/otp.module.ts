import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports:[ ConfigModule.forRoot(),MailerModule],
  controllers: [OtpController],
  providers: [OtpService,PrismaService],
  exports:[OtpService]
})
export class OtpModule {}
