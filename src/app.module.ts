import { Module } from '@nestjs/common';
import { PrismaModule } from './core/database/prisma.module';
import { ConfigModule } from '@nestjs/config'
import { SeederModule } from './core/seed/seeder.module';
import { JwtModule } from '@nestjs/jwt';
import { TelegrafModule } from 'nestjs-telegraf';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { MentorModule } from './modules/mentor/mentor.module';
import { AssistantModule } from './modules/assistant/assistant.module';
import { StudentModule } from './modules/student/student.module';
import { CoursesModule } from './modules/courses/courses.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SectionsModule } from './modules/sections/sections.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { MaterialsModule } from './modules/materials/materials.module';
import { HomeworksModule } from './modules/homeworks/homeworks.module';
import { ExamsModule } from './modules/exams/exams.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { OtpModule } from './modules/otp/otp.module';
import { BotModule } from './modules/bot/bot.module';

@Module({
  imports: [
    JwtModule.register({
      secret:process.env.SECRET_KEY,
      global:true
    }),
    ConfigModule.forRoot({
      isGlobal:true
    }),
    TelegrafModule.forRoot({
      token: process.env.BOT_TOKEN!,
    }),
    PrismaModule,
    SeederModule,
    OtpModule,
    BotModule,
    UsersModule,
    AuthModule,
    MentorModule,
    AssistantModule,
    StudentModule,
    CoursesModule,
    CategoriesModule,
    SectionsModule,
    LessonsModule,
    MaterialsModule,
    HomeworksModule,
    ExamsModule,
    UploadsModule,
  ],
})
export class AppModule {}

