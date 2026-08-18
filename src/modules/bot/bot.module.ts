import { Module } from '@nestjs/common';
import { BotUpdate } from './bot.update';
import { OtpModule } from '../otp/otp.module';

@Module({
  imports: [OtpModule],
  providers: [BotUpdate],
})
export class BotModule {}
