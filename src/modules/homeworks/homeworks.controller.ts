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
import { HomeworksService } from "./homeworks.service";
import { CreateHomeworkDto } from "./dto/create-homework.dto";
import { UpdateHomeworkDto } from "./dto/update-homework.dto";
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

@ApiTags("Homeworks")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("homeworks")
export class HomeworksController {
    constructor(private readonly homeworksService: HomeworksService) {}

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: ` ${Role.SUPERADMIN} ${Role.ADMIN}` })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            required: ["lessonId", "description"],
            properties: {
                lessonId: { type: "number" },
                description: { type: "string" },
                file: { format: "binary", type: "string", description: "Vazifa fayli (ixtiyoriy)" },
            },
        },
    })
    @Post()
    @UseInterceptors(
        FileInterceptor("file", {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const folder = file.mimetype?.startsWith("video/") ? "videos" : "files";
                    const uploadPath = `./src/uploads/${folder}`;
                    if (!fs.existsSync(uploadPath)) {
                        fs.mkdirSync(uploadPath, { recursive: true });
                    }
                    cb(null, uploadPath);
                },
                filename: (req, file, cb) => {
                    const filename = new Date().getTime() + "-" + file.originalname;
                    cb(null, filename);
                },
            }),
        }),
    )
    createHomework(
        @Body() payload: CreateHomeworkDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.homeworksService.createHomework(payload, file?.filename);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.ASSISTANT)
    @ApiOperation({})
    @Get()
    findAllHomeworks() {
        return this.homeworksService.findAllHomeworks();
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.ASSISTANT)
    @ApiOperation({ })
    @Get(":id")
    findOneHomework(@Param("id", ParseIntPipe) id: number) {
        return this.homeworksService.findOneHomework(id);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: ` - ${Role.SUPERADMIN} ${Role.ADMIN}` })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                lessonId: { type: "number" },
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
                    const folder = file.mimetype?.startsWith("video/") ? "videos" : "files";
                    const uploadPath = `./src/uploads/${folder}`;
                    if (!fs.existsSync(uploadPath)) {
                        fs.mkdirSync(uploadPath, { recursive: true });
                    }
                    cb(null, uploadPath);
                },
                filename: (req, file, cb) => {
                    const filename = new Date().getTime() + "-" + file.originalname;
                    cb(null, filename);
                },
            }),
        }),
    )
    updateHomework(
        @Param("id", ParseIntPipe) id: number,
        @Body() payload: UpdateHomeworkDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.homeworksService.updateHomework(id, payload, file?.filename);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: ` - ${Role.SUPERADMIN} ${Role.ADMIN}` })
    @Delete(":id")
    deleteHomework(@Param("id", ParseIntPipe) id: number) {
        return this.homeworksService.deleteHomework(id);
    }
}
