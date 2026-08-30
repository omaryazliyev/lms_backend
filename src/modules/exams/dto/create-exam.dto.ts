import { ApiProperty } from "@nestjs/swagger";
import { Answer } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsString, MinLength } from "class-validator";

export class CreateExamDto {
    @ApiProperty()
    @Type(() => Number)
    @IsNumber()
    lessonId!: number;

    @ApiProperty({ example: "React nima?" })
    @IsString()
    @MinLength(1)
    question!: string;

    @ApiProperty({ example: "Kutubxona" })
    @IsString()
    variantA!: string;

    @ApiProperty({ example: "Freymvork" })
    @IsString()
    variantB!: string;

    @ApiProperty({ example: "Dasturlash tili" })
    @IsString()
    variantC!: string;

    @ApiProperty({ example: "Brazauzer" })
    @IsString()
    variantD!: string;

    @ApiProperty({ enum: Answer, example: Answer.variantA })
    @IsEnum(Answer)
    answer!: Answer;
}
