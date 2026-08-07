import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { UpdateLessonDto } from "./dto/update-lesson.dto";

@Injectable()
export class LessonsService {
    constructor(private readonly prisma: PrismaService) {}

    async createLesson(payload: CreateLessonDto, filename?: string) {
        if (!filename) {
            throw new BadRequestException("Dars fayli (video) yuklanishi shart!");
        }

        const section = await this.prisma.sections.findUnique({
            where: { id: payload.sectionId },
        });

        if (!section) {
            throw new NotFoundException("Bo'lim topilmadi!");
        }

        const exist = await this.prisma.lessons.findUnique({
            where: { name: payload.name },
        });

        if (exist) {
            throw new ConflictException("Bu nomli dars allaqachon mavjud!");
        }

        await this.prisma.lessons.create({
            data: {
                name: payload.name,
                sectionId: payload.sectionId,
                description: payload.description,
                file: filename,
            },
        });

        return {
            success: true,
            message: "Dars muvaffaqiyatli yaratildi!",
        };
    }

    async findAllLessons() {
        return this.prisma.lessons.findMany({
            include: {
                sections: {
                    include: { course: true },
                },
                materials: true,
                homeworks: true,
            },
            orderBy: { create_at: "asc" },
        });
    }

    async findOneLesson(id: number) {
        const lesson = await this.prisma.lessons.findUnique({
            where: { id },
            include: {
                sections: {
                    include: { course: true },
                },
                materials: { include: { files: true } },
                homeworks: true,
            },
        });

        if (!lesson) {
            throw new NotFoundException("Dars topilmadi!");
        }

        return lesson;
    }

    async updateLesson(
        id: number,
        payload: UpdateLessonDto,
        filename?: string,
    ) {
        const exist = await this.prisma.lessons.findUnique({
            where: { id },
        });

        if (!exist) {
            throw new NotFoundException("Dars topilmadi!");
        }

        if (payload.sectionId) {
            const section = await this.prisma.sections.findUnique({
                where: { id: payload.sectionId },
            });
            if (!section) {
                throw new NotFoundException("Bo'lim topilmadi!");
            }
        }

        if (payload.name && payload.name !== exist.name) {
            const duplicate = await this.prisma.lessons.findUnique({
                where: { name: payload.name },
            });
            if (duplicate) {
                throw new ConflictException("Bu nomli dars allaqachon mavjud!");
            }
        }

        const dataToUpdate: any = { ...payload };
        if (filename) dataToUpdate.file = filename;

        await this.prisma.lessons.update({
            where: { id },
            data: dataToUpdate,
        });

        return {
            success: true,
            message: "Dars muvaffaqiyatli yangilandi!",
        };
    }

    async deleteLesson(id: number) {
        const exist = await this.prisma.lessons.findUnique({
            where: { id },
        });

        if (!exist) {
            throw new NotFoundException("Dars topilmadi!");
        }

        await this.prisma.lessons.delete({ where: { id } });

        return {
            success: true,
            message: "Dars muvaffaqiyatli o'chirildi!",
        };
    }
}
