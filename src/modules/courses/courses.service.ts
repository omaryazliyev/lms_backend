import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";

@Injectable()
export class CoursesService {
    constructor(private readonly prisma: PrismaService) {}

    async createCourse(
        payload: CreateCourseDto,
        banner?: string,
        intro_video?: string,
    ) {
        if (!banner) throw new BadRequestException("Banner (rasm) majburiy!");
        if (!intro_video) throw new BadRequestException("Intro video majburiy!");

        const existCourse = await this.prisma.courses.findFirst({
            where: { name: payload.name },
        });
        if (existCourse) {
            throw new ConflictException("Bu nomli kurs allaqachon mavjud!");
        }

        const mentorProfile = await this.prisma.mentorProfile.findFirst({
            where: { id: payload.mentorId },
        });
        if (!mentorProfile) {
            throw new NotFoundException("Mentor topilmadi (mentorId)");
        }

        const category = await this.prisma.categories.findFirst({
            where: { id: payload.categoryId },
        });
        if (!category) {
            throw new NotFoundException("Kategoriya topilmadi (categoryId)");
        }

        await this.prisma.courses.create({
            data: {
                name: payload.name,
                description: payload.description,
                prise: payload.prise,
                level: payload.level,
                banner,
                intro_video,
                mentorId: payload.mentorId,
                categoryId: payload.categoryId,
                assistentId: payload.assistentId || null,
            },
        });

        return {
            success: true,
            message: "Kurs muvaffaqiyatli yaratildi!",
        };
    }

    async findAllCourses() {
        return this.prisma.courses.findMany({
            include: {
                categories: true,
                mentorProfile: {
                    include: { users: true },
                },
                user: true,
                sections: true,
            },
            orderBy: { create_at: "desc" },
        });
    }

    async findOneCourse(id: number) {
        const course = await this.prisma.courses.findUnique({
            where: { id },
            include: {
                categories: true,
                mentorProfile: {
                    include: { users: true },
                },
                user: true,
                sections: {
                    include: { lessons: true },
                },
            },
        });

        if (!course) {
            throw new NotFoundException("Kurs topilmadi!");
        }

        return course;
    }

    async updateCourse(
        id: number,
        payload: UpdateCourseDto,
        banner?: string,
        intro_video?: string,
    ) {
        const existCourse = await this.prisma.courses.findUnique({
            where: { id },
        });

        if (!existCourse) {
            throw new NotFoundException("Kurs topilmadi!");
        }

        if (payload.name && payload.name !== existCourse.name) {
            const duplicate = await this.prisma.courses.findFirst({
                where: { name: payload.name },
            });
            if (duplicate) {
                throw new ConflictException("Bu nomli kurs allaqachon mavjud!");
            }
        }

        const dataToUpdate: any = { ...payload };
        if (banner) dataToUpdate.banner = banner;
        if (intro_video) dataToUpdate.intro_video = intro_video;

        await this.prisma.courses.update({
            where: { id },
            data: dataToUpdate,
        });

        return {
            success: true,
            message: "Kurs muvaffaqiyatli yangilandi!",
        };
    }

    async deleteCourse(id: number) {
        const existCourse = await this.prisma.courses.findUnique({
            where: { id },
        });

        if (!existCourse) {
            throw new NotFoundException("Kurs topilmadi!");
        }

        await this.prisma.courses.delete({ where: { id } });

        return {
            success: true,
            message: "Kurs muvaffaqiyatli o'chirildi!",
        };
    }
}
