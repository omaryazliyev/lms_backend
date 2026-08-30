import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsString, MinLength } from "class-validator";

export class CreateHomeworkDto {
    @ApiProperty({ example: 1, description: "Qaysi darsga tegishliligi (lessonId)" })
    @Type(() => Number)
    @IsNumber()
    lessonId!: number;

    @ApiProperty({ example: "Ushbu vazifada siz quyidagi shartlarni bajarishingiz kerak..." })
    @IsString()
    @MinLength(1)
    description!: string;
}
