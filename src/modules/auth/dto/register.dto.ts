import { ApiProperty } from "@nestjs/swagger"
import { IsString, MinLength, Matches, IsOptional, IsInt } from "class-validator"
import { Type } from "class-transformer"

export class RegisterDto {

    @ApiProperty()
    @IsString()
    @MinLength(3)
    full_name!: string

    @ApiProperty({ example: "+998901234567" })
    @IsString()
    @Matches(/^\+?[0-9\s\-\(\)]{7,20}$/, { message: "Telefon raqam noto'g'ri formatda" })
    phone!: string

    @ApiProperty()
    @IsString()
    @MinLength(3)
    password!: string

    @ApiProperty()
    @IsString()
    code!: string

    @ApiProperty({ required: false, example: 1 })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    courseId?: number
}