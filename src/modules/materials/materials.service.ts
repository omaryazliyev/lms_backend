import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateMaterialDto } from "./dto/create-material.dto";
import { UpdateMaterialDto } from "./dto/update-material.dto";

@Injectable()
export class MaterialsService {
    constructor(private readonly prisma: PrismaService) {}

    async createMaterial(payload: CreateMaterialDto, filenames: string[]) {
        const lesson = await this.prisma.lessons.findUnique({
            where: { id: payload.lessonId },
        });

        if (!lesson) {
            throw new NotFoundException("Dars topilmadi!");
        }

        const material = await this.prisma.materials.create({
            data: {
                lessonId: payload.lessonId,
                description: payload.description,
            },
        });

        if (filenames && filenames.length > 0) {
            const fileData = filenames.map((f) => ({
                materialId: material.id,
                file: f,
            }));
            await this.prisma.materialFile.createMany({
                data: fileData,
            });
        }

        return {
            success: true,
            message: "Material muvaffaqiyatli yaratildi!",
        };
    }

    async findAllMaterials() {
        return this.prisma.materials.findMany({
            include: { files: true, lessons: true },
            orderBy: { create_at: "asc" },
        });
    }

    async findOneMaterial(id: number) {
        const material = await this.prisma.materials.findUnique({
            where: { id },
            include: { files: true, lessons: true },
        });

        if (!material) {
            throw new NotFoundException("Material topilmadi!");
        }

        return material;
    }

    async updateMaterial(id: number, payload: UpdateMaterialDto, filenames: string[]) {
        const material = await this.prisma.materials.findUnique({
            where: { id },
        });

        if (!material) {
            throw new NotFoundException("Material topilmadi!");
        }

        if (payload.lessonId) {
            const lesson = await this.prisma.lessons.findUnique({
                where: { id: payload.lessonId },
            });
            if (!lesson) {
                throw new NotFoundException("Dars topilmadi!");
            }
        }

        await this.prisma.materials.update({
            where: { id },
            data: {
                ...(payload.description && { description: payload.description }),
                ...(payload.lessonId && { lessonId: payload.lessonId }),
            },
        });

        // Add new files if any are provided
        if (filenames && filenames.length > 0) {
            const fileData = filenames.map((f) => ({
                materialId: id,
                file: f,
            }));
            await this.prisma.materialFile.createMany({
                data: fileData,
            });
        }

        return {
            success: true,
            message: "Material muvaffaqiyatli yangilandi!",
        };
    }

    async deleteMaterial(id: number) {
        const material = await this.prisma.materials.findUnique({
            where: { id },
        });

        if (!material) {
            throw new NotFoundException("Material topilmadi!");
        }

        await this.prisma.materials.delete({ where: { id } });

        return {
            success: true,
            message: "Material muvaffaqiyatli o'chirildi!",
        };
    }

    // Individual file deletion
    async deleteMaterialFile(fileId: number) {
        const file = await this.prisma.materialFile.findUnique({
            where: { id: fileId },
        });

        if (!file) {
            throw new NotFoundException("Fayl topilmadi!");
        }

        await this.prisma.materialFile.delete({ where: { id: fileId } });

        return {
            success: true,
            message: "Material fayli o'chirildi!",
        };
    }
}
