import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import * as argon from "argon2"

@Injectable()
export class UserSeeder implements OnModuleInit {
    constructor(private readonly prisma: PrismaService) { }
    async onModuleInit() {
        const existUser = await this.prisma.users.findUnique({
            where:{
                phone:"+998938749060"
            }
        })
        if (existUser){
            return Logger.log("✅ SuperAdmin already exists")
        }
        await this.prisma.users.create({
            data: {
                full_name: "Omar Yazliyev",
                phone: "+998938749060",
                password: await argon.hash(process.env.USER_PASSWORD as string),
                role: "SUPERADMIN"
            }
        })

        Logger.log("✅ SuperAdmin created ")
    }
}