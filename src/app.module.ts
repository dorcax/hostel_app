import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
// import { PrismaService } from '../prisma.service';
import { MailerModule } from './mailer/mailer.module';
import{ConfigModule, ConfigService} from "@nestjs/config"
import { OtpModule } from './otp/otp.module';
import { JwtModule } from '@nestjs/jwt';
import config  from './config/config';


@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true ,cache:true,
      load:[config],
    }),
    JwtModule.registerAsync({
      imports:[ConfigModule],
      useFactory:async(config)=>({
        secret:config.get("JWT_SECRET")
      }),
    
      global:true,
      inject:[ConfigService]
    }),
    AuthModule, MailerModule,OtpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
