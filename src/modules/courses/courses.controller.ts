import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { CoursesService } from "./courses.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
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
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as fs from "fs";

const courseStorage = diskStorage({
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
});

@ApiTags("Courses")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("courses")
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) {}

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: `Create Course - ${Role.SUPERADMIN} ${Role.ADMIN}` })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            required: ["name", "description", "prise", "level", "mentorId", "categoryId", "banner", "intro_video"],
            properties: {
                name: { type: "string" },
                description: { type: "string" },
                prise: { type: "number" },
                level: { type: "string", enum: ["BEGINNER", "ELEMENTERY", "PRE_INTERMEDIATE", "INTERMEDIATE", "ADVANCED"] },
                mentorId: { type: "number" },
                categoryId: { type: "number" },
                assistentId: { type: "number" },
                banner: { format: "binary", type: "string", description: "Kurs banneri (rasm)" },
                intro_video: { format: "binary", type: "string", description: "Kirish videosi" },
            },
        },
    })
    @Post()
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: "banner", maxCount: 1 },
                { name: "intro_video", maxCount: 1 },
            ],
            { storage: courseStorage },
        ),
    )
    createCourse(
        @Body() payload: CreateCourseDto,
        @UploadedFiles() files: { banner?: Express.Multer.File[]; intro_video?: Express.Multer.File[] },
    ) {
        return this.coursesService.createCourse(
            payload,
            files?.banner?.[0]?.filename,
            files?.intro_video?.[0]?.filename,
        );
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.ASSISTANT)
    @ApiOperation({ summary: "Get all Courses" })
    @Get()
    findAllCourses() {
        return this.coursesService.findAllCourses();
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.ASSISTANT)
    @ApiOperation({ summary: "Get one Course by ID" })
    @Get(":id")
    findOneCourse(@Param("id", ParseIntPipe) id: number) {
        return this.coursesService.findOneCourse(id);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: `Update Course - ${Role.SUPERADMIN} ${Role.ADMIN}` })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                name: { type: "string" },
                description: { type: "string" },
                prise: { type: "number" },
                level: { type: "string", enum: ["BEGINNER", "ELEMENTERY", "PRE_INTERMEDIATE", "INTERMEDIATE", "ADVANCED"] },
                mentorId: { type: "number" },
                categoryId: { type: "number" },
                assistentId: { type: "number" },
                banner: { format: "binary", type: "string" },
                intro_video: { format: "binary", type: "string" },
            },
        },
    })
    @Patch(":id")
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: "banner", maxCount: 1 },
                { name: "intro_video", maxCount: 1 },
            ],
            { storage: courseStorage },
        ),
    )
    updateCourse(
        @Param("id", ParseIntPipe) id: number,
        @Body() payload: UpdateCourseDto,
        @UploadedFiles() files: { banner?: Express.Multer.File[]; intro_video?: Express.Multer.File[] },
    ) {
        return this.coursesService.updateCourse(
            id,
            payload,
            files?.banner?.[0]?.filename,
            files?.intro_video?.[0]?.filename,
        );
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: `Delete Course - ${Role.SUPERADMIN} ${Role.ADMIN}` })
    @Delete(":id")
    deleteCourse(@Param("id", ParseIntPipe) id: number) {
        return this.coursesService.deleteCourse(id);
    }
}
