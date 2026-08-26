import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { StudentService } from "./student.service";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { AuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorator/roles";
import { Role } from "@prisma/client";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as fs from 'fs';

@ApiTags("Student")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("student")
export class StudentController {
    constructor(private readonly studentService: StudentService) {}

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @Get()
    findAllStudents() {
        return this.studentService.findAllStudents();
    }

    @Roles(Role.STUDENT)
    @Get("my-course")
    getMyCourse(@Req() req: any) {
        return this.studentService.getMyCourse(req.user?.id);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @Get(":id")
    findOneStudent(@Param("id", ParseIntPipe) id: number) {
        return this.studentService.findOneStudent(id);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @Patch(":id/toggle-paid")
    togglePaid(@Param("id", ParseIntPipe) id: number) {
        return this.studentService.togglePaid(id);
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
    updateStudent(
        @Param("id", ParseIntPipe) id: number,
        @Body() payload: UpdateStudentDto,
        @UploadedFile() file?: Express.Multer.File
    ) {
        return this.studentService.updateStudent(id, payload, file?.filename);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @Delete(":id")
    deleteStudent(@Param("id", ParseIntPipe) id: number) {
        return this.studentService.deleteStudent(id);
    }
}
