import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsString, MinLength } from "class-validator";

export class CreateSectionDto {
    @ApiProperty({ example: "1-modul. Kirish" })
    @IsString()
    @MinLength(2)
    name!: string;

    @ApiProperty({ example: 1, description: "Qaysi kursga tegishliligi (courseId)" })
    @Type(() => Number)
    @IsNumber()
    courseId!: number;
}
