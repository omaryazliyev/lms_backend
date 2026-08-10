import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { LessonsService } from "./lessons.service";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { UpdateLessonDto } from "./dto/update-lesson.dto";
import { AuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorator/roles";
import { Role } from "@prisma/client";
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as fs from "fs";

@ApiTags("Lessons")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("lessons")
export class LessonsController {
    constructor(private readonly lessonsService: LessonsService) {}

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: ` - ${Role.SUPERADMIN} ${Role.ADMIN}` })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            required: ["name", "sectionId", "description", "file"],
            properties: {
                name: { type: "string" },
                sectionId: { type: "number" },
                description: { type: "string" },
                file: { format: "binary", type: "string", description: "Dars videosi" },
            },
        },
    })
    @Post()
    @UseInterceptors(
        FileInterceptor("file", {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const folder = file.mimetype.startsWith("video/") ? "videos" : "images";
                    const uploadPath = `./src/uploads/${folder}`;
                    if (!fs.existsSync(uploadPath)) {
                        fs.mkdirSync(uploadPath, { recursive: true });
                    }
                    cb(null, uploadPath);
                },
                filename: (req, file, cb) => {
                    const filename = new Date().getTime() + "." + file.mimetype.split("/")[1];
                    cb(null, filename);
                },
            }),
        }),
    )
    createLesson(
        @Body() payload: CreateLessonDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.lessonsService.createLesson(payload, file?.filename);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.ASSISTANT)
    @ApiOperation({ })
    @Get()
    findAllLessons() {
        return this.lessonsService.findAllLessons();
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.ASSISTANT)
    @ApiOperation({ })
    @Get(":id")
    findOneLesson(@Param("id", ParseIntPipe) id: number) {
        return this.lessonsService.findOneLesson(id);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: `Update Lesson - ${Role.SUPERADMIN} ${Role.ADMIN}` })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                name: { type: "string" },
                sectionId: { type: "number" },
                description: { type: "string" },
                file: { format: "binary", type: "string" },
            },
        },
    })
    @Patch(":id")
    @UseInterceptors(
        FileInterceptor("file", {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const folder = file.mimetype.startsWith("video/") ? "videos" : "images";
                    const uploadPath = `./src/uploads/${folder}`;
                    if (!fs.existsSync(uploadPath)) {
                        fs.mkdirSync(uploadPath, { recursive: true });
                    }
                    cb(null, uploadPath);
                },
                filename: (req, file, cb) => {
                    const filename = new Date().getTime() + "." + file.mimetype.split("/")[1];
                    cb(null, filename);
                },
            }),
        }),
    )
    updateLesson(
        @Param("id", ParseIntPipe) id: number,
        @Body() payload: UpdateLessonDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.lessonsService.updateLesson(id, payload, file?.filename);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: ` ${Role.SUPERADMIN} ${Role.ADMIN}` })
    @Delete(":id")
    deleteLesson(@Param("id", ParseIntPipe) id: number) {
        return this.lessonsService.deleteLesson(id);
    }
}
