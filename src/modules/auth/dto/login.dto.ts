import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, Matches } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "+998901234567", description: "Telefon raqami" })
  @IsString()
  @Matches(/^\+?[0-9\s\-\(\)]{7,20}$/, { message: "Telefon raqam noto'g'ri formatda" })
  phone!: string;

  @ApiProperty({ example: "18062004", description: "Parol" })
  @IsString()
  @MinLength(3)
  password!: string;
}
