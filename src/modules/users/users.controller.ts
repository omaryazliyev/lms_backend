import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Delete, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from "multer"
import * as fs from 'fs';
import { UserService } from "./users.service";
import { AuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorator/roles";
import { Role } from "@prisma/client";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import {  UpdateAdminDto } from "./dto/update-admin.dto";


@ApiTags("Admin")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({
        summary: `${Role.SUPERADMIN}  ${Role.ADMIN}`
    })
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
    @Post("admin")
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
    createAdmin(
        @Body() payload: CreateAdminDto,
        @UploadedFile() file?: Express.Multer.File
    ) {
        return this.userService.createAdmin(payload, file?.filename)
    }


    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @Get("admin")
    findAllAdmins() {
        return this.userService.findAllAdmins();
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @Get("admin/:id")
    findOneAdmin(@Param("id", ParseIntPipe) id: number) {
        return this.userService.findOneAdmin(id);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiConsumes("multipart/form-data")
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
                const filename = new Date().getTime() + file.mimetype.split("/")[1];
                cb(null, filename);
            }
        })
    }))
    updateAdmin(
        @Body() payload: UpdateAdminDto,
        @Param("id", ParseIntPipe) id: number,
        @UploadedFile() file?: Express.Multer.File
    ) {
        return this.userService.updateAdmin(payload, id, file?.filename);
    }

    @Roles(Role.SUPERADMIN)
    @Delete(":id")
    deleteAdmin(@Param("id", ParseIntPipe) id: number) {
        return this.userService.deleteAdmin(id);
    }
}
