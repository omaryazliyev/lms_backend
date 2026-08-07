import { DocumentBuilder } from "@nestjs/swagger";

export const config = new DocumentBuilder()
    .setTitle('lms docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();