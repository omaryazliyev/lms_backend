import { PartialType } from "@nestjs/swagger";
import { CreateCourseDto } from "./create-course.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";
import { Transform } from "class-transformer";

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
    @ApiPropertyOptional({ description: "Kursni faollashtirish/o'chirish" })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === "true" || value === true) return true;
        if (value === "false" || value === false) return false;
        return value;
    })
    @IsBoolean()
    isActive?: boolean;
}
