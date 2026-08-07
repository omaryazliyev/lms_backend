import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, MaxLength } from "class-validator";

export class CreateCategoryDto {
    @ApiProperty({ example: "Frontend dasturlash" })
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    name!: string;
}
