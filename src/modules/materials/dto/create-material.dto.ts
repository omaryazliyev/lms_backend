import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsString, MinLength } from "class-validator";

export class CreateMaterialDto {
    @ApiProperty({ example: 1, description: "Qaysi darsga tegishliligi (lessonId)" })
    @Type(() => Number)
    @IsNumber()
    lessonId!: number;

    @ApiProperty({ example: "Bu dars uchun qo'shimcha PDF qo'llanmalar." })
    @IsString()
    @MinLength(1)
    description!: string;
}
