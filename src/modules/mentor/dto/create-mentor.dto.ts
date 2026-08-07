import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsMobilePhone, IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateMentorDto {
    @ApiProperty()
    @IsString()
    @MaxLength(30)
    @MinLength(3)
    full_name!: string;

    @ApiProperty()
    @IsMobilePhone()
    phone!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty()
    @IsString()
    @MinLength(3)
    password!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    experiense?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    job?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    web_link?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    fecebook?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    telegram?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    linkedin?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    instagram?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    github?: string;
}
