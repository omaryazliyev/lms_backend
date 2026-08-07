import { ApiProperty } from "@nestjs/swagger"
import { IsMobilePhone, IsString, MinLength } from "class-validator"


export class RegisterDto {

    @ApiProperty()
    @IsString()
    @MinLength(3)
    full_name!: string

    @ApiProperty()
    @IsMobilePhone()
    phone!: string

    @ApiProperty()
    @IsString()
    @MinLength(3)
    password!:string
}