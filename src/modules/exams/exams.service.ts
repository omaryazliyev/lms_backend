import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateExamDto } from "./dto/create-exam.dto";
import { UpdateExamDto } from "./dto/update-exam.dto";

@Injectable()
export class ExamsService {
    constructor(private readonly prisma: PrismaService) {}

    async createExam(payload: CreateExamDto) {
        const lesson = await this.prisma.lessons.findUnique({
            where: { id: payload.lessonId },
        });

        if (!lesson) {
            throw new NotFoundException("Dars topilmadi!");
        }

        await this.prisma.exams.create({
            data: payload,
        });

        return {
            success: true,
            message: "Test savoli muvaffaqiyatli yaratildi!",
        };
    }

    async findAllExams() {
        return this.prisma.exams.findMany({
            orderBy: { create_at: "asc" },
        });
    }

    async findOneExam(id: number) {
        const exam = await this.prisma.exams.findUnique({
            where: { id },
        });

        if (!exam) {
            throw new NotFoundException("Test savoli topilmadi!");
        }

        return exam;
    }

    async updateExam(id: number, payload: UpdateExamDto) {
        const exist = await this.prisma.exams.findUnique({
            where: { id },
        });

        if (!exist) {
            throw new NotFoundException("Test savoli topilmadi!");
        }

        if (payload.lessonId) {
            const lesson = await this.prisma.lessons.findUnique({
                where: { id: payload.lessonId },
            });
            if (!lesson) {
                throw new NotFoundException("Dars topilmadi!");
            }
        }

        await this.prisma.exams.update({
            where: { id },
            data: payload,
        });

        return {
            success: true,
            message: "Test savoli muvaffaqiyatli yangilandi!",
        };
    }

    async deleteExam(id: number) {
        const exist = await this.prisma.exams.findUnique({
            where: { id },
        });

        if (!exist) {
            throw new NotFoundException("Test savoli topilmadi!");
        }

        await this.prisma.exams.delete({ where: { id } });

        return {
            success: true,
            message: "Test savoli muvaffaqiyatli o'chirildi!",
        };
    }
}
