import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsEmail, IsMobilePhone, IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Type } from "class-transformer";

export class CreateAssistantDto {
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

    @ApiPropertyOptional({ type: [Number] })
    @IsOptional()
    @IsArray()
    @Type(() => Number)
    @IsNumber({}, { each: true })
    courseIds?: number[];
}
