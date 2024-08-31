import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { otpDto } from './dto/otpDto';
import { MailerService } from '../mailer/mailer.service';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { Address } from 'nodemailer/lib/mailer';
import * as bcrypt from 'bcrypt';
import { add } from 'date-fns';
@Injectable()
export class OtpService {
  constructor(
    private readonly mailerService: MailerService,
    private prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}
  // create otp and sed email

  async sendOtp(userId: number, res) {
    try {
      // find otp
      const otpUser = await this.prisma.otp.deleteMany({
        where: {
          userId,
        },
      });

      //  generate new otp code
      const generateNewOtp = await this.generateOtp();

      // find if user exist
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
      if (!user) {
        throw new NotFoundException('user not found');
      }

      // send email to the user

      try {
        const Otpmailresult = await this.mailerService.sendEmail({
          from: {
            name: this.configService.get<string>('APP_NAME'),
            address: this.configService.get<string>('DEFAULT_EMAIL'),
          },
          recipients: {
            name: user.name,
            address: user.email,
          },
          subject: 'verify your email',
          html: `<p>Enter  <strong>${generateNewOtp}</strong> in the app to verify your email address </p>`,
        });
      } catch (error) {
        throw new BadRequestException('Failed to send OTP email');
      }

      //   save the otp record
      const hashedOtp = await this.hashOtp(generateNewOtp);
      await this.prisma.otp.create({
        data: {
          otpCode: hashedOtp,
          createdAt: new Date(),
          expiry: add(new Date(), { hours: 1 }),
          user: {
            connect: {
              id: userId,
            },
          },
        },
      });
      return { message: 'OTP sent to email' };
    } catch (error) {
      throw new BadRequestException('Failed to send OTP');
    }
  }
  // generate pin to be send

  private generateOtp(): string {
    try {
      const otp = Math.floor(Math.random() * 9000) + 1000;
      return otp.toString();
    } catch (error) {
      throw new BadRequestException('failed in creating a new otp');
    }
  }

  // hashed otp

  private async hashOtp(otpCode: string) {
    try {
      const hashedOtp = await bcrypt.hash(otpCode, 10);
      return hashedOtp;
    } catch (error) {
      throw new BadRequestException('Failed to hash OTP');
    }
  }

  //    verifyotpCode
  async verifyOtpCode(otpCode: string) {
    //  get all OTP records
    try {
        const otpResults = await this.prisma.otp.findMany();

        // If no OTP records are found, return an error
        if (!otpResults || otpResults.length === 0) {
          throw new BadRequestException('Otp not found');
        }
    
        let otpResult = null;
        //    loop through the result
        for (let otp of otpResults) {
          const isOtpValid = await bcrypt.compare(otpCode, otp.otpCode);
          if (isOtpValid) {
            otpResult = otp;
            break;
          }
        }
    
        // Check if the OTP result does not exist
        if (!otpResult) {
          throw new BadRequestException('invalid otp');
        }
    
        // Check if the OTP has expired
        if (new Date() > otpResult.expiry) {
          throw new BadRequestException('OTP has expired');
        }
        // . Find the user associated with the OTP
        const user = await this.prisma.user.findUnique({
          where: { id: otpResult.userId },
        });
    
        if (!user) {
          throw new BadRequestException('User not found');
        }
    
        return otpResult;
    } catch (error) {
        throw new BadRequestException("invalid otp")
    }
    
  }

  // find otp

  async getOtp(otpCode: string) {
    const getOtp = await this.prisma.otp.findUnique({
      where: {
        otpCode: otpCode,
      },
    });
    return getOtp;
  }

  async deleteOtp(userId: number) {
    const deleteOtp = await this.prisma.otp.deleteMany({
      where: {
        id: userId,
      },
    });
  }
}
