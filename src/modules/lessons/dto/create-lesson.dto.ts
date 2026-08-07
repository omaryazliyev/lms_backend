import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsString, MinLength } from "class-validator";

export class CreateLessonDto {
    @ApiProperty({ example: "1-dars. Dasturlashga kirish" })
    @IsString()
    @MinLength(2)
    name!: string;

    @ApiProperty({ example: 1, description: "Qaysi bo'limga tegishliligi (sectionId)" })
    @Type(() => Number)
    @IsNumber()
    sectionId!: number;

    @ApiProperty({ example: "Bu darsda dasturlash haqida umumiy tushunchalar beriladi." })
    @IsString()
    @MinLength(5)
    description!: string;
}
