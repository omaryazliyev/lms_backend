import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateAssistantDto } from "./dto/create-assistant.dto";
import { UpdateAssistantDto } from "./dto/update-assistant.dto";
import { Role } from "@prisma/client";
import hashPassword from "src/common/config/hash";

@Injectable()
export class AssistantService {
    constructor(private readonly prisma: PrismaService) {}

    async createAssistant(payload: CreateAssistantDto, filename?: string) {
        const existAssistant = await this.prisma.users.findUnique({
            where: {phone:payload.phone}
        });

        if (existAssistant) {
            throw new ConflictException("User already exists with this email or phone");
        }

        const hashedPassword = await hashPassword(payload.password);

        await this.prisma.users.create({
            data: {
                full_name: payload.full_name,
                phone: payload.phone,
                email: payload.email || null,
                password: hashedPassword,
                role: Role.ASSISTANT,
                file: filename || null,
                assistCourses: payload.courseIds && payload.courseIds.length > 0 ? {
                    connect: payload.courseIds.map(id => ({ id }))
                } : undefined
            }
        });

        return {
            success: true,
            message: "Assistant created successfully!"
        };
    }

    async findAllAssistants() {
        return this.prisma.users.findMany({
            where: { role: Role.ASSISTANT },
            include: { assistCourses: true }
        });
    }

    async findOneAssistant(id: number) {
        const assistant = await this.prisma.users.findFirst({
            where: { id, role: Role.ASSISTANT },
            include: { assistCourses: true }
        });

        if (!assistant) {
            throw new NotFoundException("Assistant not found with this id");
        }

        return assistant;
    }

    async updateAssistant(id: number, payload: UpdateAssistantDto, filename?: string) {
        const existAssistant = await this.prisma.users.findFirst({
            where: { id, role: Role.ASSISTANT }
        });

        if (!existAssistant) {
            throw new NotFoundException("Assistant not found with this id");
        }

        const { courseIds, ...userFields } = payload;
        
        let dataToUpdate: any = { ...userFields };
        if (payload.password) {
            dataToUpdate.password = await hashPassword(payload.password);
        }
        if (filename) {
            dataToUpdate.file = filename;
        }

        if (courseIds !== undefined) {
            dataToUpdate.courses = {
                set: courseIds.map(courseId => ({ id: courseId }))
            };
        }

        await this.prisma.users.update({
            where: { id },
            data: dataToUpdate
        });

        return {
            success: true,
            message: "Assistant updated successfully!"
        };
    }

    async deleteAssistant(id: number) {
        const existAssistant = await this.prisma.users.findFirst({
            where: { id, role: Role.ASSISTANT }
        });

        if (!existAssistant) {
            throw new NotFoundException("Assistant not found with this id");
        }

        
        await this.prisma.users.update({
            where: { id },
            data: {
                assistCourses: {
                    set: []
                }
            }
        });

        await this.prisma.users.delete({
            where: { id }
        });

        return {
            success: true,
            message: "Assistant deleted successfully!"
        };
    }
}
