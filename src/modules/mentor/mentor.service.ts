import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateMentorDto } from "./dto/create-mentor.dto";
import { UpdateMentorDto } from "./dto/update-mentor.dto";
import { Role } from "@prisma/client";
import hashPassword from "src/common/config/hash";

@Injectable()
export class MentorService {
    constructor(private readonly prisma: PrismaService) {}

    async createMentor(payload: CreateMentorDto, filename?: string) {
        const existMentor = await this.prisma.users.findUnique({
            where: {phone:payload.phone}
        });

        if (existMentor) {
            throw new ConflictException("User already exists with this email or phone");
        }

        const hashedPassword = await hashPassword(payload.password);

        await this.prisma.users.create({
            data: {
                full_name: payload.full_name,
                phone: payload.phone,
                email: payload.email || null,
                password: hashedPassword,
                role: Role.TEACHER,
                file: filename || null,
                mentorProfile: {
                    create: {
                        experiense: payload.experiense || null,
                        job: payload.job || null,
                        web_link: payload.web_link || null,
                        description: payload.description || null,
                        facebook: payload.fecebook || null,
                        telegram: payload.telegram || null,
                        linkedin: payload.linkedin || null,
                        instagram: payload.instagram || null,
                        github: payload.github || null,
                    }
                }
            }
        });

        return {
            success: true,
            message: "Mentor created successfully!"
        };
    }

    async findAllMentors() {
        return this.prisma.users.findMany({
            where: { role: Role.TEACHER },
            include: { mentorProfile: true, assistCourses: true }
        });
    }

    async findOneMentor(id: number) {
        const mentor = await this.prisma.users.findFirst({
            where: { id, role: Role.TEACHER },
            include: { mentorProfile: true, assistCourses: true }
        });

        if (!mentor) {
            throw new NotFoundException("Mentor not found with this id");
        }

        return mentor;
    }

    async updateMentor(id: number, payload: UpdateMentorDto, filename?: string) {
        const existMentor = await this.prisma.users.findFirst({
            where: { id, role: Role.TEACHER },
            include: { mentorProfile: true }
        });

        if (!existMentor) {
            throw new NotFoundException("Mentor not found with this id");
        }

        // Separate user fields and profile fields
        const { experiense, job, web_link, description, fecebook, telegram, linkedin, instagram, github, ...userFields } = payload;
        
        let dataToUpdate: any = { ...userFields };
        if (payload.password) {
            dataToUpdate.password = await hashPassword(payload.password);
        }
        if (filename) {
            dataToUpdate.file = filename;
        }

        // Update user and mentor profile
        await this.prisma.users.update({
            where: { id },
            data: {
                ...dataToUpdate,
                mentorProfile: {
                    updateMany: {
                        where: { usersId: id },
                        data: {
                            experiense,
                            job,
                            web_link,
                            description,
                            fecebook,
                            telegram,
                            linkedin,
                            instagram,
                            github
                        }
                    }
                }
            }
        });

        return {
            success: true,
            message: "Mentor updated successfully!"
        };
    }

    async deleteMentor(id: number) {
        const existMentor = await this.prisma.users.findFirst({
            where: { id, role: Role.TEACHER }
        });

        if (!existMentor) {
            throw new NotFoundException("Mentor not found with this id");
        }

        // The schema might need onDelete: Cascade or we delete the profile first.
        // Wait, I will just delete the user, and if it fails due to FK, I should delete MentorProfile first.
        // Let's delete MentorProfile first, then user.
        await this.prisma.mentorProfile.deleteMany({
            where: { usersId: id }
        });

        await this.prisma.users.delete({
            where: { id }
        });

        return {
            success: true,
            message: "Mentor deleted successfully!"
        };
    }

    async getMyStudents(userId: number) {
        // Find mentor's MentorProfile(s) by user ID
        const mentorProfiles = await this.prisma.mentorProfile.findMany({
            where: { usersId: userId },
            include: {
                courses: {
                    include: {
                        students: {
                            select: {
                                id: true,
                                full_name: true,
                                phone: true,
                                email: true,
                                file: true,
                                isPaid: true,
                                create_at: true,
                                courses: { select: { id: true, name: true, prise: true } }
                            }
                        }
                    }
                }
            }
        });

        // Flatten all students across all courses this mentor teaches
        const studentMap = new Map<number, any>();
        for (const profile of mentorProfiles) {
            for (const course of profile.courses) {
                for (const student of course.students) {
                    if (!studentMap.has(student.id)) {
                        studentMap.set(student.id, {
                            ...student,
                            course: { id: course.id, name: course.name, prise: course.prise }
                        });
                    }
                }
            }
        }

        return {
            success: true,
            data: Array.from(studentMap.values())
        };
    }
}
