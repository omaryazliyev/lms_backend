import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Role } from "@prisma/client";


interface JwtPayload {
    id:number
    role:Role
    full_name:string
}

@Injectable()
export class jwtAccessToken {
    constructor(private jwtService : JwtService){}
    jwtAccessToken(payload : JwtPayload){
        return this.jwtService.sign(payload, {secret:process.env.SECRET_KEY, expiresIn:"30m"})
    }

    jwtRefreshToken(payload : JwtPayload){
        return this.jwtService.sign(payload, {secret:process.env.SECRET_KEY, expiresIn:"30d"})
    }
}