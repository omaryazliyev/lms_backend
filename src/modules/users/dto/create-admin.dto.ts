import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsEmail, IsMobilePhone, IsOptional, IsString, MaxLength, MinLength } from "class-validator"


export class CreateAdminDto {
    @ApiProperty()
    @IsString()
    @MaxLength(30)
    @MinLength(3)
    full_name!:string

    @ApiProperty()
    @IsMobilePhone()
    phone!:string

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    email?:string

    @ApiProperty()
    @IsString()
    @MinLength(3)
    password!:string
}