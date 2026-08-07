import { Body, Controller, Get, Headers, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/common/guards/jwt-auth.guard";
import { RegisterDto } from "./dto/register.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiOperation({ summary: "LOGIN" })
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }


  @Post("refresh")
  refresh(@Headers("authorization") authHeader: string) {
    const token = authHeader?.split(" ")[1];
    return this.authService.refreshToken(token);
  }

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

}
