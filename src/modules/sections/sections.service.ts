import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateSectionDto } from "./dto/create-section.dto";
import { UpdateSectionDto } from "./dto/update-section.dto";

@Injectable()
export class SectionsService {
    constructor(private readonly prisma: PrismaService) {}

    async createSection(payload: CreateSectionDto) {
        // Kurs mavjudligini tekshirish
        const course = await this.prisma.courses.findUnique({
            where: { id: payload.courseId },
        });

        if (!course) {
            throw new NotFoundException("Bunday ID ga ega kurs topilmadi!");
        }

        // Section nomi qaytarilmasligini tekshirish
        const exist = await this.prisma.sections.findUnique({
            where: { name: payload.name },
        });

        if (exist) {
            throw new ConflictException("Bu nomli bo'lim (section) allaqachon mavjud!");
        }

        await this.prisma.sections.create({
            data: {
                name: payload.name,
                courseId: payload.courseId,
            },
        });

        return {
            success: true,
            message: "Bo'lim muvaffaqiyatli yaratildi!",
        };
    }

    async findAllSections() {
        return this.prisma.sections.findMany({
            include: {
                course: { select: { id: true, name: true } },
                lessons: true,
            },
            orderBy: { create_at: "asc" },
        });
    }

    async findOneSection(id: number) {
        const section = await this.prisma.sections.findUnique({
            where: { id },
            include: {
                course: true,
                lessons: true,
            },
        });

        if (!section) {
            throw new NotFoundException("Bo'lim topilmadi!");
        }

        return section;
    }

    async updateSection(id: number, payload: UpdateSectionDto) {
        const exist = await this.prisma.sections.findUnique({
            where: { id },
        });

        if (!exist) {
            throw new NotFoundException("Bo'lim topilmadi!");
        }

        if (payload.courseId) {
            const course = await this.prisma.courses.findUnique({
                where: { id: payload.courseId },
            });
            if (!course) {
                throw new NotFoundException("Bunday ID ga ega kurs topilmadi!");
            }
        }

        if (payload.name && payload.name !== exist.name) {
            const duplicate = await this.prisma.sections.findUnique({
                where: { name: payload.name },
            });
            if (duplicate) {
                throw new ConflictException("Bu nomli bo'lim allaqachon mavjud!");
            }
        }

        await this.prisma.sections.update({
            where: { id },
            data: payload,
        });

        return {
            success: true,
            message: "Bo'lim muvaffaqiyatli yangilandi!",
        };
    }

    async deleteSection(id: number) {
        const exist = await this.prisma.sections.findUnique({
            where: { id },
        });

        if (!exist) {
            throw new NotFoundException("Bo'lim topilmadi!");
        }

        await this.prisma.sections.delete({ where: { id } });

        return {
            success: true,
            message: "Bo'lim muvaffaqiyatli o'chirildi!",
        };
    }
}
