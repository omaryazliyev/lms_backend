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
import { MaterialsService } from "./materials.service";
import { CreateMaterialDto } from "./dto/create-material.dto";
import { UpdateMaterialDto } from "./dto/update-material.dto";
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
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as fs from "fs";

@ApiTags("Materials")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("materials")
export class MaterialsController {
    constructor(private readonly materialsService: MaterialsService) {}

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
                files: {
                    type: "array",
                    items: { type: "string", format: "binary" },
                    description: "Material fayllari (ko'p bo'lishi mumkin)",
                },
            },
        },
    })
    @Post()
    @UseInterceptors(
        FilesInterceptor("files", 10, {
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
                    const filename = new Date().getTime() + "-" + file.originalname;
                    cb(null, filename);
                },
            }),
        }),
    )
    createMaterial(
        @Body() payload: CreateMaterialDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        const filenames = files?.map((f) => f.filename) || [];
        return this.materialsService.createMaterial(payload, filenames);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.ASSISTANT)
    @ApiOperation({  })
    @Get()
    findAllMaterials() {
        return this.materialsService.findAllMaterials();
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.ASSISTANT)
    @ApiOperation({ })
    @Get(":id")
    findOneMaterial(@Param("id", ParseIntPipe) id: number) {
        return this.materialsService.findOneMaterial(id);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: ` ${Role.SUPERADMIN} ${Role.ADMIN}` })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                lessonId: { type: "number" },
                description: { type: "string" },
                files: {
                    type: "array",
                    items: { type: "string", format: "binary" },
                },
            },
        },
    })
    @Patch(":id")
    @UseInterceptors(
        FilesInterceptor("files", 10, {
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
                    const filename = new Date().getTime() + "-" + file.originalname;
                    cb(null, filename);
                },
            }),
        }),
    )
    updateMaterial(
        @Param("id", ParseIntPipe) id: number,
        @Body() payload: UpdateMaterialDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        const filenames = files?.map((f) => f.filename) || [];
        return this.materialsService.updateMaterial(id, payload, filenames);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: ` ${Role.SUPERADMIN} ${Role.ADMIN}` })
    @Delete(":id")
    deleteMaterial(@Param("id", ParseIntPipe) id: number) {
        return this.materialsService.deleteMaterial(id);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: ` ${Role.SUPERADMIN} ${Role.ADMIN}` })
    @Delete("file/:fileId")
    deleteMaterialFile(@Param("fileId", ParseIntPipe) fileId: number) {
        return this.materialsService.deleteMaterialFile(fileId);
    }
}
