// src/auth/mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'boardflow10@gmail.com',
        pass: 'TVOJ_APP_PASSWORD', // App Password
      },
    });
  }

  async sendOtp(email: string, otp: number) {
    try {
      const info = await this.transporter.sendMail({
        from: '"BoardFlow" <boardflow10@gmail.com>',
        to: email,
        subject: 'Potvrdite svoj nalog',
        text: `Zdravo! 👋\n\nVaš kod za verifikaciju naloga je: ${otp}.\nKod ističe za 2 minuta.\n\nAko niste vi tražili ovaj kod, slobodno ignorišite ovu poruku.`,
      });

      console.log('📧 OTP email poslat:', info.messageId);
      return true;
    } catch (error) {
      console.error('❌ Greška pri slanju OTP emaila:', error);
      return false;
    }
  }
}
