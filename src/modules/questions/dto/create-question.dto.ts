import { IsInt, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateQuestionDto {
    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    lessonId: number;

    @ApiProperty()
    @IsString()
    text: string;
}
