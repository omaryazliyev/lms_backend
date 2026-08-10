import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from "@nestjs/common";
import { ExamsService } from "./exams.service";
import { CreateExamDto } from "./dto/create-exam.dto";
import { UpdateExamDto } from "./dto/update-exam.dto";
import { AuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorator/roles";
import { Role } from "@prisma/client";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("Exams")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("exams")
export class ExamsController {
    constructor(private readonly examsService: ExamsService) {}

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: ` ${Role.SUPERADMIN} ${Role.ADMIN}` })
    @Post()
    createExam(@Body() payload: CreateExamDto) {
        return this.examsService.createExam(payload);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.ASSISTANT)
    @ApiOperation({  })
    @Get()
    findAllExams() {
        return this.examsService.findAllExams();
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.ASSISTANT)
    @ApiOperation({  })
    @Get(":id")
    findOneExam(@Param("id", ParseIntPipe) id: number) {
        return this.examsService.findOneExam(id);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: ` ${Role.SUPERADMIN} ${Role.ADMIN}` })
    @Patch(":id")
    updateExam(
        @Param("id", ParseIntPipe) id: number,
        @Body() payload: UpdateExamDto,
    ) {
        return this.examsService.updateExam(id, payload);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: ` ${Role.SUPERADMIN} ${Role.ADMIN}` })
    @Delete(":id")
    deleteExam(@Param("id", ParseIntPipe) id: number) {
        return this.examsService.deleteExam(id);
    }
}
