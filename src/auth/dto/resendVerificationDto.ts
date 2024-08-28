import { IsEmail, IsNotEmpty, IsNumber } from "class-validator"

export class resendVerificationDto{
 

    @IsNotEmpty()
    @IsEmail()
    email:string
}