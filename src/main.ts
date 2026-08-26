import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { config } from './common/config/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true
  }))

  app.setGlobalPrefix("/api/v1")

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory);


  // Telegraf Conflict yoki boshqa kutilmagan xatoliklar ilovani butunlay o'chirib yubormasligi uchun
  process.on('uncaughtException', (err) => {
    console.error('Kutilmagan xatolik (Uncaught Exception):', err.message);
  });
  process.on('unhandledRejection', (reason: any) => {
    console.error('Kutilmagan rad etish (Unhandled Rejection):', reason?.message || reason);
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
