import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CourseLevel } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from "class-validator";

export class CreateCourseDto {
    @ApiProperty({ example: "Frontend dasturlash kursi" })
    @IsString()
    @MinLength(3)
    name!: string;

    @ApiProperty({ example: "Bu kurs frontend dasturlashni o'rgatadi" })
    @IsString()
    @MinLength(5)
    description!: string;

    @ApiProperty({ example: 299000 })
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    prise!: number;

    @ApiProperty({ enum: CourseLevel, example: CourseLevel.BEGINNER })
    @IsEnum(CourseLevel)
    level!: CourseLevel;

    @ApiProperty({ example: 1, description: "MentorProfile.id" })
    @Type(() => Number)
    @IsNumber()
    mentorId!: number;

    @ApiProperty({ example: 1, description: "Categories.id" })
    @Type(() => Number)
    @IsNumber()
    categoryId!: number;

    @ApiPropertyOptional({ example: 1, description: "Users.id (Assistant)" })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    assistentId?: number;
}
