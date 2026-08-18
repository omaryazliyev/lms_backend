import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/core/database/prisma.service";
import { LoginDto } from "./dto/login.dto";
import * as argon from "argon2";
import { RegisterDto } from "./dto/register.dto";
import { Role } from "@prisma/client";
import { OtpService } from "../otp/otp.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService
  ) { }

  async login(dto: LoginDto) {
    const existUser = await this.prisma.users.findFirst({
      where: { phone: dto.phone },
    });

    if (!existUser) {
      throw new NotFoundException("User Not Found");
    }

    const isPasswordValid = await argon.verify(existUser.password, dto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("User not found with this phone or password");
    }

    const payload = {
      id: existUser.id,
      role: existUser.role,
      full_name: existUser.full_name,
    };

    const access_token = this.jwtService.sign(payload, {
      secret: process.env.SECRET_KEY,
      expiresIn: "30m",
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_SECRET_KEY || process.env.SECRET_KEY,
      expiresIn: "30d",
    });

    return {
      success: true,
      data: {
        access_token,
        refresh_token
      },
    };
  }


  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.REFRESH_SECRET_KEY || process.env.SECRET_KEY,
      });

      const user = await this.prisma.users.findFirst({
        where: { id: payload.id },
      });

      if (!user) {
        throw new NotFoundException("User not fou d");
      }

      const newPayload = {
        id: user.id,
        role: user.role,
        full_name: user.full_name,
      };

      const access_token = this.jwtService.sign(newPayload, {
        secret: process.env.SECRET_KEY,
        expiresIn: "30m",
      });

      return {
        success: true,
        access_token,
      };
    } catch {
      throw new UnauthorizedException("Invalid Token");
    }
  }


  async register(dto: RegisterDto) {
    // 1. Verify OTP first
    const isOtpValid = this.otpService.verifyOtp(dto.phone, dto.code);
    if (!isOtpValid) {
      throw new UnauthorizedException("Tasdiqlash kodi noto'g'ri yoki vaqti tugagan!");
    }

    const existUser = await this.prisma.users.findFirst({
      where: { phone: dto.phone },
    });

    if (existUser) {
      throw new ConflictException("User with this phone number already exists");
    }

    const hashedPassword = await argon.hash(dto.password);

    const newUser = await this.prisma.users.create({
      data: {
        phone: dto.phone,
        password: hashedPassword,
        full_name: dto.full_name,
        role:Role.STUDENT
      },
    });

    const payload = {
      id: newUser.id,
      role: newUser.role,
      full_name: newUser.full_name,
    };

    const access_token = this.jwtService.sign(payload, {
      secret: process.env.SECRET_KEY,
      expiresIn: "30m",
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.SECRET_KEY,
      expiresIn: "30d",
    });

    return {
      success: true,
      data: {
        access_token,
        refresh_token,
      },
    };
  }


}
