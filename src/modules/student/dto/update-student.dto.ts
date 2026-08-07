import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsMobilePhone, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateStudentDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MaxLength(30)
    @MinLength(3)
    full_name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsMobilePhone()
    phone?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @MinLength(3)
    password?: string;
}
