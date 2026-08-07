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
import { SectionsService } from "./sections.service";
import { CreateSectionDto } from "./dto/create-section.dto";
import { UpdateSectionDto } from "./dto/update-section.dto";
import { AuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorator/roles";
import { Role } from "@prisma/client";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("Sections")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("sections")
export class SectionsController {
    constructor(private readonly sectionsService: SectionsService) {}

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: `Create Section - ${Role.SUPERADMIN} ${Role.ADMIN}` })
    @Post()
    createSection(@Body() payload: CreateSectionDto) {
        return this.sectionsService.createSection(payload);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.ASSISTANT)
    @ApiOperation({ summary: "Get all Sections" })
    @Get()
    findAllSections() {
        return this.sectionsService.findAllSections();
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.ASSISTANT)
    @ApiOperation({ summary: "Get one Section by ID" })
    @Get(":id")
    findOneSection(@Param("id", ParseIntPipe) id: number) {
        return this.sectionsService.findOneSection(id);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: `Update Section - ${Role.SUPERADMIN} ${Role.ADMIN}` })
    @Patch(":id")
    updateSection(
        @Param("id", ParseIntPipe) id: number,
        @Body() payload: UpdateSectionDto,
    ) {
        return this.sectionsService.updateSection(id, payload);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: `Delete Section - ${Role.SUPERADMIN} ${Role.ADMIN}` })
    @Delete(":id")
    deleteSection(@Param("id", ParseIntPipe) id: number) {
        return this.sectionsService.deleteSection(id);
    }
}
