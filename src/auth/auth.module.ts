import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma.service';
// import { OtpService } from '../otp/otp.service';
import { OtpModule } from '../otp/otp.module';

@Module({
  imports:[OtpModule],
  controllers: [AuthController],
  providers: [AuthService,PrismaService],

})
export class AuthModule {}
