import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { QuestionsService } from "./questions.service";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { AnswerQuestionDto } from "./dto/answer-question.dto";
import { AuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorator/roles";
import { Role } from "@prisma/client";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("Questions")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("questions")
export class QuestionsController {
    constructor(private readonly questionsService: QuestionsService) {}

    // Student or any user asks a question
    @Roles(Role.STUDENT, Role.TEACHER, Role.ADMIN, Role.SUPERADMIN)
    @ApiOperation({ summary: "Savol berish" })
    @Post()
    createQuestion(@Req() req: any, @Body() dto: CreateQuestionDto) {
        return this.questionsService.createQuestion(req.user.id, dto);
    }

    // Get questions for a lesson (student sees own, mentor sees all)
    @Roles(Role.STUDENT, Role.TEACHER, Role.ADMIN, Role.SUPERADMIN)
    @ApiOperation({ summary: "Dars savollari ro'yxati" })
    @Get("lesson/:lessonId")
    getByLesson(
        @Param("lessonId", ParseIntPipe) lessonId: number,
        @Req() req: any
    ) {
        return this.questionsService.getQuestionsByLesson(lessonId, req.user.id, req.user.role);
    }

    // Mentor gets all questions from their courses
    @Roles(Role.TEACHER, Role.ADMIN, Role.SUPERADMIN)
    @ApiOperation({ summary: "Mentor - o'z kurslaridagi barcha savollar" })
    @Get("mentor/all")
    getMentorQuestions(@Req() req: any) {
        return this.questionsService.getMentorQuestions(req.user.id);
    }

    // Mentor answers a question
    @Roles(Role.TEACHER, Role.ADMIN, Role.SUPERADMIN)
    @ApiOperation({ summary: "Mentordan javob berish" })
    @Patch(":id/answer")
    answerQuestion(
        @Param("id", ParseIntPipe) id: number,
        @Req() req: any,
        @Body() dto: AnswerQuestionDto
    ) {
        return this.questionsService.answerQuestion(req.user.id, id, dto);
    }

    // Student deletes their question
    @Roles(Role.STUDENT)
    @ApiOperation({ summary: "Savolni o'chirish" })
    @Delete(":id")
    deleteQuestion(
        @Param("id", ParseIntPipe) id: number,
        @Req() req: any
    ) {
        return this.questionsService.deleteQuestion(id, req.user.id);
    }
}
