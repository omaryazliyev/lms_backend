import { ApiProperty } from "@nestjs/swagger";
import { IsMobilePhone, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "+998938749060", description: "Telefon raqami" })
  @IsMobilePhone()
  phone!: string;

  @ApiProperty({ example: "18062004", description: "Parol" })
  @IsString()
  @MinLength(3)
  password!: string;
}
