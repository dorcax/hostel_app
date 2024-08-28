import{IsEmail, IsString, Matches} from "class-validator"
export class CreateSignUpDto{
    @IsString()
    name:string;

    @IsEmail()
    email:string;

    @IsString()
    @Matches(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d].{8,}$/,{
        message:"Password must contain at least 8 characters,including one uppercase letter and one number"
    })
    password:string
}