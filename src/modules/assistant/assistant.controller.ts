import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { AssistantService } from "./assistant.service";
import { CreateAssistantDto } from "./dto/create-assistant.dto";
import { UpdateAssistantDto } from "./dto/update-assistant.dto";
import { AuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorator/roles";
import { Role } from "@prisma/client";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as fs from 'fs';

@ApiTags("Assistant")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("assistant")
export class AssistantController {
    constructor(private readonly assistantService: AssistantService) {}

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
                courseIds: { type: "array", items: { type: "number" } },
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
    createAssistant(
        @Body() payload: CreateAssistantDto,
        @UploadedFile() file?: Express.Multer.File
    ) {
        return this.assistantService.createAssistant(payload, file?.filename);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @Get()
    findAllAssistants() {
        return this.assistantService.findAllAssistants();
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @Get(":id")
    findOneAssistant(@Param("id", ParseIntPipe) id: number) {
        return this.assistantService.findOneAssistant(id);
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
                courseIds: { type: "array", items: { type: "number" } },
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
    updateAssistant(
        @Param("id", ParseIntPipe) id: number,
        @Body() payload: UpdateAssistantDto,
        @UploadedFile() file?: Express.Multer.File
    ) {
        return this.assistantService.updateAssistant(id, payload, file?.filename);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @Delete(":id")
    deleteAssistant(@Param("id", ParseIntPipe) id: number) {
        return this.assistantService.deleteAssistant(id);
    }
}
