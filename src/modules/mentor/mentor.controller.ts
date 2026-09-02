import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { MentorService } from "./mentor.service";
import { CreateMentorDto } from "./dto/create-mentor.dto";
import { UpdateMentorDto } from "./dto/update-mentor.dto";
import { AuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorator/roles";
import { Role } from "@prisma/client";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as fs from 'fs';

@ApiTags("Mentor")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("mentor")
export class MentorController {
    constructor(private readonly mentorService: MentorService) {}

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                full_name: { type: "string" },
                phone: { type: "string" },
                email: { type: "string" },
                password: { type: "string" },
                experiense: { type: "number" },
                job: { type: "string" },
                web_link: { type: "string" },
                description: { type: "string" },
                fecebook: { type: "string" },
                telegram: { type: "string" },
                linkedin: { type: "string" },
                instagram: { type: "string" },
                github: { type: "string" },
                file: { format: "binary", type: "string" }
            }
        }
    })


    @Post()
    @UseInterceptors(FileInterceptor("file", {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const folder = file.mimetype.startsWith('video/') ? 'videos' : 'images';
                const uploadPath = `./src/uploads/${folder}`;
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const filename = new Date().getTime() + file.mimetype.split("/")[1]
                cb(null, filename)
            }
        })
    }))
    createMentor(
        @Body() payload: CreateMentorDto,
        @UploadedFile() file?: Express.Multer.File
    ) {
        return this.mentorService.createMentor(payload, file?.filename);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @Get()
    findAllMentors() {
        return this.mentorService.findAllMentors();
    }

    @Roles(Role.TEACHER)
    @ApiOperation({ summary: "Mentor - o'z o'quvchilarini ko'rish" })
    @Get("my-students")
    getMyStudents(@Req() req: any) {
        return this.mentorService.getMyStudents(req.user?.id);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @Get(":id")
    findOneMentor(@Param("id", ParseIntPipe) id: number) {
        return this.mentorService.findOneMentor(id);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                full_name: { type: "string" },
                phone: { type: "string" },
                email: { type: "string" },
                password: { type: "string" },
                experiense: { type: "number" },
                job: { type: "string" },
                web_link: { type: "string" },
                description: { type: "string" },
                fecebook: { type: "string" },
                telegram: { type: "string" },
                linkedin: { type: "string" },
                instagram: { type: "string" },
                github: { type: "string" },
                file: { format: "binary", type: "string" }
            }
        }
    })
    @Patch(":id")
    @UseInterceptors(FileInterceptor("file", {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const folder = file.mimetype.startsWith('video/') ? 'videos' : 'images';
                const uploadPath = `./src/uploads/${folder}`;
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const filename = new Date().getTime() + file.mimetype.split("/")[1]
                cb(null, filename)
            }
        })
    }))
    updateMentor(
        @Param("id", ParseIntPipe) id: number,
        @Body() payload: UpdateMentorDto,
        @UploadedFile() file?: Express.Multer.File
    ) {
        return this.mentorService.updateMentor(id, payload, file?.filename);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @Delete(":id")
    deleteMentor(@Param("id", ParseIntPipe) id: number) {
        return this.mentorService.deleteMentor(id);
    }
}
