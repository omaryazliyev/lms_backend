import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateHomeworkDto } from "./dto/create-homework.dto";
import { UpdateHomeworkDto } from "./dto/update-homework.dto";

@Injectable()
export class HomeworksService {
    constructor(private readonly prisma: PrismaService) {}

    async createHomework(payload: CreateHomeworkDto, filename?: string) {
        const lesson = await this.prisma.lessons.findUnique({
            where: { id: payload.lessonId },
        });

        if (!lesson) {
            throw new NotFoundException("Dars topilmadi!");
        }

        await this.prisma.homeworks.create({
            data: {
                lessonId: payload.lessonId,
                description: payload.description,
                file: filename || null,
            },
        });

        return {
            success: true,
            message: "Uy vazifasi muvaffaqiyatli yaratildi!",
        };
    }

    async findAllHomeworks() {
        return this.prisma.homeworks.findMany({
            include: { lesson: true },
            orderBy: { create_at: "asc" },
        });
    }

    async findOneHomework(id: number) {
        const homework = await this.prisma.homeworks.findUnique({
            where: { id },
            include: { lesson: true },
        });

        if (!homework) {
            throw new NotFoundException("Uy vazifasi topilmadi!");
        }

        return homework;
    }

    async updateHomework(
        id: number,
        payload: UpdateHomeworkDto,
        filename?: string,
    ) {
        const exist = await this.prisma.homeworks.findUnique({
            where: { id },
        });

        if (!exist) {
            throw new NotFoundException("Uy vazifasi topilmadi!");
        }

        if (payload.lessonId) {
            const lesson = await this.prisma.lessons.findUnique({
                where: { id: payload.lessonId },
            });
            if (!lesson) {
                throw new NotFoundException("Dars topilmadi!");
            }
        }

        const dataToUpdate: any = { ...payload };
        if (filename) dataToUpdate.file = filename;

        await this.prisma.homeworks.update({
            where: { id },
            data: dataToUpdate,
        });

        return {
            success: true,
            message: "Uy vazifasi muvaffaqiyatli yangilandi!",
        };
    }

    async deleteHomework(id: number) {
        const exist = await this.prisma.homeworks.findUnique({
            where: { id },
        });

        if (!exist) {
            throw new NotFoundException("Uy vazifasi topilmadi!");
        }

        await this.prisma.homeworks.delete({ where: { id } });

        return {
            success: true,
            message: "Uy vazifasi muvaffaqiyatli o'chirildi!",
        };
    }
}
