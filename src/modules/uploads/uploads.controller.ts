import { Controller, Get, Param, Res } from "@nestjs/common";
import type { Response } from "express";
import { join } from "path";
import * as fs from "fs";

@Controller("uploads")
export class UploadsController {
    @Get(":type/:filename")
    serveFile(
        @Param("type") type: string,
        @Param("filename") filename: string,
        @Res() res: Response
    ) {
        const filePath = join(process.cwd(), "src/uploads", type, filename);
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).send("File not found");
        }
    }
}
