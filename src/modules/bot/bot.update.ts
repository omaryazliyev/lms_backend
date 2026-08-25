import { Update, Start, On, Ctx } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { OtpService } from '../otp/otp.service';

@Update()
export class BotUpdate {
  constructor(private readonly otpService: OtpService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await ctx.reply(
      "Assalomu alaykum! IT Live platformasida ro'yxatdan o'tish uchun telefon raqamingizni yuboring.",
      {
        reply_markup: {
          keyboard: [
            [{ text: "📞 Kontaktni yuborish", request_contact: true }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      },
    );
  }

  @On('contact')
  async onContact(@Ctx() ctx: Context) {
    const message = ctx.message as any;
    const contact = message.contact;
    let phone = contact.phone_number;

    // Normalize: remove all non-digit chars, then add + prefix
    phone = '+' + phone.replace(/[^\d]/g, '');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    this.otpService.setOtp(phone, otp);

    await ctx.reply(
      `Sizning tasdiqlash kodingiz: <b>${otp}</b>\n\nKodni veb-saytga kiritib ro'yxatdan o'tishni yakunlang.`,
      {
        parse_mode: 'HTML',
        reply_markup: { remove_keyboard: true },
      },
    );
  }

  @On('text')
  async onText(@Ctx() ctx: Context) {
    await ctx.reply(
      "Iltimos, telefon raqamingizni qo'lda yozmang! Pastdagi **📞 Kontaktni yuborish** tugmasi orqali jo'nating.",
      {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [
            [{ text: "📞 Kontaktni yuborish", request_contact: true }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      }
    );
  }
}
