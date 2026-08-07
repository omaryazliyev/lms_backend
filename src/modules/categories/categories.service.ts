import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService) {}

    async createCategory(payload: CreateCategoryDto) {
        const exist = await this.prisma.categories.findFirst({
            where: { name: payload.name },
        });

        if (exist) {
            throw new ConflictException("Bu nomli kategoriya allaqachon mavjud!");
        }

        await this.prisma.categories.create({
            data: { name: payload.name },
        });

        return {
            success: true,
            message: "Kategoriya muvaffaqiyatli yaratildi!",
        };
    }

    async findAllCategories() {
        return this.prisma.categories.findMany({
            include: { _count: { select: { courses: true } } },
            orderBy: { create_at: "desc" },
        });
    }

    async findOneCategory(id: number) {
        const category = await this.prisma.categories.findUnique({
            where: { id },
            include: { courses: true },
        });

        if (!category) {
            throw new NotFoundException("Kategoriya topilmadi!");
        }

        return category;
    }

    async updateCategory(id: number, payload: UpdateCategoryDto) {
        const exist = await this.prisma.categories.findUnique({
            where: { id },
        });

        if (!exist) {
            throw new NotFoundException("Kategoriya topilmadi!");
        }

        if (payload.name && payload.name !== exist.name) {
            const duplicate = await this.prisma.categories.findFirst({
                where: { name: payload.name },
            });
            if (duplicate) {
                throw new ConflictException("Bu nomli kategoriya allaqachon mavjud!");
            }
        }

        await this.prisma.categories.update({
            where: { id },
            data: { name: payload.name },
        });

        return {
            success: true,
            message: "Kategoriya muvaffaqiyatli yangilandi!",
        };
    }

    async deleteCategory(id: number) {
        const exist = await this.prisma.categories.findUnique({
            where: { id },
        });

        if (!exist) {
            throw new NotFoundException("Kategoriya topilmadi!");
        }

        await this.prisma.categories.delete({ where: { id } });

        return {
            success: true,
            message: "Kategoriya muvaffaqiyatli o'chirildi!",
        };
    }
}
