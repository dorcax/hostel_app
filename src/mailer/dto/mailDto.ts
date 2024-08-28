// import { IsOptional, ValidateNested } from "class-validator";
import { Address } from "nodemailer/lib/mailer";
// import { Type } from "class-transformer";
export class sendEmailDto {
    // @IsOptional()
    // @ValidateNested()
    // @Type(() => Address)
    from?:Address;

    recipients:Address;
    subject:string;
    html:string;
    placeholderReplacement?:  Record<string,string>           

}