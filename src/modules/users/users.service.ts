import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { Role } from "@prisma/client";
import hashPassword from "src/common/config/hash";
import { UpdateAdminDto } from "./dto/update-admin.dto";


@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }


    async createAdmin(payload: CreateAdminDto, filename?: string) {
        const existAdmin = await this.prisma.users.findFirst({
            where: {
                OR: [
                    { phone: payload.phone },
                    { email: payload.email }
                ]
            }
        })

        if (existAdmin) {
            throw new ConflictException("Admin already exist with this email or phone")
        }

        await this.prisma.users.create({
            data: {
                ...payload,
                role: Role.ADMIN,
                password: await hashPassword(payload.password),
                file: filename || null
            }
        })

        return {
            success: true,
            message: "Admin crated successfully!"
        }
    }

    async findAllAdmins() {
        return this.prisma.users.findMany({
            where: { role: Role.ADMIN }
        });
    }

    async findOneAdmin(id: number) {
        const admin = await this.prisma.users.findFirst({
            where: { id, role: { in: [Role.ADMIN, Role.SUPERADMIN] } }
        });

        if (!admin) {
            throw new NotFoundException("Admin not found with this id");
        }

        return admin;
    }


    async updateAdmin(payload: UpdateAdminDto, id: number, filename?: string) {

        const existAdmin = await this.prisma.users.findUnique({
            where:{id}
        })

        if(!existAdmin){
            throw new NotFoundException("Admin not found with this id ")
        }

        let dataToUpdate = { ...payload };

        if (payload.password) {
            dataToUpdate.password = await hashPassword(payload.password);
        }

        if (filename) {
            (dataToUpdate as any).file = filename;
        }

        await this.prisma.users.update({
            where: { id: id },
            data: dataToUpdate
        })

        return {
            success: true,
            message: "Update admin successfully!"
        }
    }

    async deleteAdmin(id: number) {
        const existAdmin = await this.prisma.users.findUnique({
            where: { id }
        });

        if (!existAdmin) {
            throw new NotFoundException("Admin not found with this id");
        }

        await this.prisma.users.delete({
            where: { id }
        });

        return {
            success: true,
            message: "Admin deleted successfully!"
        };
    }
}