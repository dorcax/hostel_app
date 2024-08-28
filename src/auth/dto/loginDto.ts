import {  IsEmail, IsNotEmpty, IsString } from "class-validator"
 export class LoginDto {
    @IsEmail()
    @IsNotEmpty({ message: 'Password must not be empty' })
    email:string

    @IsString()
    @IsNotEmpty()
    password:string
 }
