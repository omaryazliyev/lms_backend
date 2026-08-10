import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CourseLevel } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";

export class CreateCourseDto {
    @ApiProperty()
    @IsString()
    @MinLength(3)
    name!: string;

    @ApiProperty()
    @IsString()
    @MinLength(5)
    description!: string;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    prise!: number;

    @ApiProperty({ enum: CourseLevel })
    @IsEnum(CourseLevel)
    level!: CourseLevel;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    mentorId!: number;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    categoryId!: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    assistentId?: number;
}
