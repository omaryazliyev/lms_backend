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
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { AuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorator/roles";
import { Role } from "@prisma/client";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("Categories")
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller("categories")
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: ` ${Role.SUPERADMIN} ${Role.ADMIN}` })
    @Post()
    createCategory(@Body() payload: CreateCategoryDto) {
        return this.categoriesService.createCategory(payload);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.ASSISTANT)
    @ApiOperation({})
    @Get()
    findAllCategories() {
        return this.categoriesService.findAllCategories();
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN, Role.TEACHER, Role.STUDENT, Role.ASSISTANT)
    @ApiOperation({})
    @Get(":id")
    findOneCategory(@Param("id", ParseIntPipe) id: number) {
        return this.categoriesService.findOneCategory(id);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: ` ${Role.SUPERADMIN} ${Role.ADMIN}` })
    @Patch(":id")
    updateCategory(
        @Param("id", ParseIntPipe) id: number,
        @Body() payload: UpdateCategoryDto,
    ) {
        return this.categoriesService.updateCategory(id, payload);
    }

    @Roles(Role.SUPERADMIN, Role.ADMIN)
    @ApiOperation({ summary: ` ${Role.SUPERADMIN} ${Role.ADMIN}` })
    @Delete(":id")
    deleteCategory(@Param("id", ParseIntPipe) id: number) {
        return this.categoriesService.deleteCategory(id);
    }
}
