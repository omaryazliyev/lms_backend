import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsMobilePhone, IsString, MaxLength, MinLength } from "class-validator"


export class CreateAdminDto {
    @ApiProperty()
    @IsString()
    @MaxLength(30)
    @MinLength(3)
    full_name!:string

    @ApiProperty()
    @IsMobilePhone()
    phone!:string

    @ApiProperty()
    @IsEmail()
    email!:string

    @ApiProperty()
    @IsString()
    @MinLength(3)
    password!:string
}