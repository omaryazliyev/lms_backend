import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "src/core/database/prisma.service";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { AnswerQuestionDto } from "./dto/answer-question.dto";

@Injectable()
export class QuestionsService {
    constructor(private readonly prisma: PrismaService) {}

    // Student creates a question for a lesson
    async createQuestion(studentId: number, dto: CreateQuestionDto) {
        const lesson = await this.prisma.lessons.findUnique({ where: { id: dto.lessonId } });
        if (!lesson) throw new NotFoundException("Lesson not found");

        const question = await this.prisma.questions.create({
            data: {
                lessonId: dto.lessonId,
                studentId,
                text: dto.text,
            },
            include: {
                student: { select: { id: true, full_name: true, phone: true } },
                lesson: { select: { id: true, name: true } },
            }
        });

        return { success: true, data: question };
    }

    // Get all questions for a lesson (student sees their own, mentor sees all for their courses)
    async getQuestionsByLesson(lessonId: number, userId: number, role: string) {
        const where: any = { lessonId };

        // Students only see their own questions
        if (role === "STUDENT") {
            where.studentId = userId;
        }

        const questions = await this.prisma.questions.findMany({
            where,
            include: {
                student: { select: { id: true, full_name: true, file: true } },
                answerer: { select: { id: true, full_name: true, file: true } },
            },
            orderBy: { create_at: "desc" }
        });

        return { success: true, data: questions };
    }

    // Mentor answers a question
    async answerQuestion(mentorId: number, questionId: number, dto: AnswerQuestionDto) {
        const question = await this.prisma.questions.findUnique({ where: { id: questionId } });
        if (!question) throw new NotFoundException("Question not found");

        const updated = await this.prisma.questions.update({
            where: { id: questionId },
            data: {
                answer: dto.answer,
                answeredBy: mentorId,
            },
            include: {
                student: { select: { id: true, full_name: true } },
                answerer: { select: { id: true, full_name: true, file: true } },
            }
        });

        return { success: true, data: updated };
    }

    // Mentor gets all unanswered questions for their courses
    async getMentorQuestions(mentorUserId: number) {
        // Find mentor's courses through mentorProfile
        const mentorProfiles = await this.prisma.mentorProfile.findMany({
            where: { usersId: mentorUserId },
            include: {
                courses: {
                    include: {
                        sections: {
                            include: {
                                lessons: { select: { id: true } }
                            }
                        }
                    }
                }
            }
        });

        // Collect all lesson IDs for this mentor
        const lessonIds: number[] = [];
        for (const profile of mentorProfiles) {
            for (const course of profile.courses) {
                for (const section of course.sections) {
                    for (const lesson of section.lessons) {
                        lessonIds.push(lesson.id);
                    }
                }
            }
        }

        if (lessonIds.length === 0) return { success: true, data: [] };

        const questions = await this.prisma.questions.findMany({
            where: { lessonId: { in: lessonIds } },
            include: {
                student: { select: { id: true, full_name: true, file: true, phone: true } },
                answerer: { select: { id: true, full_name: true, file: true } },
                lesson: {
                    select: {
                        id: true, name: true,
                        section: {
                            select: {
                                id: true, name: true,
                                course: { select: { id: true, name: true } }
                            }
                        }
                    }
                }
            },
            orderBy: { create_at: "desc" }
        });

        return { success: true, data: questions };
    }

    // Delete a question
    async deleteQuestion(questionId: number, studentId: number) {
        const question = await this.prisma.questions.findUnique({ where: { id: questionId } });
        if (!question) throw new NotFoundException("Question not found");
        if (question.studentId !== studentId) throw new ForbiddenException("Not your question");

        await this.prisma.questions.delete({ where: { id: questionId } });
        return { success: true, message: "Question deleted" };
    }
}
