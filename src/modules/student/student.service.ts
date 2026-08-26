import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { Role } from "@prisma/client";
import hashPassword from "src/common/config/hash";

@Injectable()
export class StudentService {
    constructor(private readonly prisma: PrismaService) {}

    async findAllStudents() {
        return this.prisma.users.findMany({
            where: { role: Role.STUDENT },
            include: {
                course: {
                    select: { id: true, name: true, prise: true }
                }
            }
        });
    }

    async findOneStudent(id: number) {
        const student = await this.prisma.users.findFirst({
            where: { id, role: Role.STUDENT }
        });

        if (!student) {
            throw new NotFoundException("Student not found with this id");
        }

        return student;
    }

    async updateStudent(id: number, payload: UpdateStudentDto, filename?: string) {
        const existStudent = await this.prisma.users.findFirst({
            where: { id, role: Role.STUDENT }
        });

        if (!existStudent) {
            throw new NotFoundException("Student not found with this id");
        }
        
        let dataToUpdate: any = { ...payload };
        
        if (payload.password) {
            dataToUpdate.password = await hashPassword(payload.password);
        }
        
        if (filename) {
            dataToUpdate.file = filename;
        }

        await this.prisma.users.update({
            where: { id },
            data: dataToUpdate
        });

        return {
            success: true,
            message: "Student updated successfully!"
        };
    }

    async togglePaid(id: number) {
        const existStudent = await this.prisma.users.findFirst({
            where: { id, role: Role.STUDENT }
        });

        if (!existStudent) {
            throw new NotFoundException("Student not found with this id");
        }

        await this.prisma.users.update({
            where: { id },
            data: { isPaid: !existStudent.isPaid }
        });

        return {
            success: true,
            isPaid: !existStudent.isPaid,
            message: !existStudent.isPaid ? "To'lov tasdiqlandi!" : "To'lov bekor qilindi!"
        };
    }

    async assignCourse(studentId: number, courseId: number | null) {
        const student = await this.prisma.users.findFirst({
            where: { id: studentId, role: Role.STUDENT }
        });
        if (!student) throw new NotFoundException("Student not found");

        await this.prisma.users.update({
            where: { id: studentId },
            data: { courseId: courseId ?? null }
        });

        return { success: true, message: "Kurs muvaffaqiyatli belgilandi!" };
    }

    async deleteStudent(id: number) {
        const existStudent = await this.prisma.users.findFirst({
            where: { id, role: Role.STUDENT }
        });

        if (!existStudent) {
            throw new NotFoundException("Student not found with this id");
        }

        await this.prisma.users.delete({
            where: { id }
        });

        return {
            success: true,
            message: "Student deleted successfully!"
        };
    }
    async getMyCourse(studentId: number) {
        const student = await this.prisma.users.findFirst({
            where: { id: studentId, role: Role.STUDENT },
            include: {
                course: {
                    include: {
                        category: true,
                        mentorProfile: { include: { user: true } },
                    }
                }
            }
        });

        if (!student) {
            throw new NotFoundException("Student not found");
        }

        return {
            success: true,
            data: student.course ? [student.course] : []
        };
    }
}
