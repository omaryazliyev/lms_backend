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
@Controller("courses")
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) {}

    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: `${Role.SUPERADMIN} ${Role.ADMIN} - Kurs yaratish` })
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

    // Admin: barcha kurslar (faol + nofaol)
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: "Admin - barcha kurslar (faol va nofaol)" })
    @Get("admin/all")
    findAllCourses() {
        return this.coursesService.findAllCourses();
    }

    // Public: faqat faol kurslar
    @ApiOperation({ summary: "Public - faqat faol kurslar" })
    @Get()
    findActiveCourses() {
        return this.coursesService.findActiveCourses();
    }

    @ApiOperation({ summary: "Kursni ID bo'yicha ko'rish" })
    @Get(":id")
    findOneCourse(@Param("id", ParseIntPipe) id: number) {
        return this.coursesService.findOneCourse(id);
    }

    // Kursni faol/nofaol qilish (toggle)
    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: "Kursni faol/nofaol qilish (toggle)" })
    @Patch(":id/toggle-active")
    toggleActive(@Param("id", ParseIntPipe) id: number) {
        return this.coursesService.toggleActive(id);
    }

    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: `${Role.SUPERADMIN} ${Role.ADMIN} - Kursni tahrirlash` })
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
                isActive: { type: "boolean" },
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

    @ApiBearerAuth()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: `${Role.SUPERADMIN} ${Role.ADMIN} - Kursni o'chirish` })
    @Delete(":id")
    deleteCourse(@Param("id", ParseIntPipe) id: number) {
        return this.coursesService.deleteCourse(id);
    }
}
