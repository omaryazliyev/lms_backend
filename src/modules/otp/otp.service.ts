import { Injectable } from '@nestjs/common';

@Injectable()
export class OtpService {
  // Store OTPs in memory for now. 
  // Map format: { "+998901234567": "123456" }
  private store = new Map<string, string>();

  setOtp(phone: string, code: string) {
    this.store.set(phone, code);
    
    // Automatically delete after 5 minutes
    setTimeout(() => {
      if (this.store.get(phone) === code) {
        this.store.delete(phone);
      }
    }, 5 * 60 * 1000);
  }

  getOtp(phone: string): string | undefined {
    return this.store.get(phone);
  }

  deleteOtp(phone: string) {
    this.store.delete(phone);
  }

  verifyOtp(phone: string, code: string): boolean {
    const storedCode = this.getOtp(phone);
    if (storedCode && storedCode === code) {
      this.deleteOtp(phone);
      return true;
    }
    return false;
  }
}
