import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.transporter =
      nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,

        auth: {
          user:
            this.configService.get<string>(
              'MAIL_USER',
            ),

          pass:
            this.configService.get<string>(
              'MAIL_PASSWORD',
            ),
        },
      });
  }

  // =========================================================
  // OTP - KLASIČNA REGISTRACIJA
  // =========================================================

  async sendOtp(
    email: string,
    otp: string,
  ) {
    try {
      const info =
        await this.transporter.sendMail({
          from:
            `"BoardFlow" <${this.configService.get<string>(
              'MAIL_USER',
            )}>`,

          to: email,

          subject:
            'Potvrda email adrese - BoardFlow',

          text: `Zdravo! 👋

Hvala što ste se registrovali na BoardFlow.

Vaš verifikacioni kod je:

${otp}

Kod važi naredna 2 minuta.

Ako niste vi pokrenuli registraciju, možete ignorisati ovu poruku.

BoardFlow tim`,
        });

      console.log(
        '📧 OTP email poslat:',
        info.messageId,
      );

      return true;
    } catch (error) {
      console.error(
        '❌ Greška pri slanju OTP emaila:',
        error,
      );

      return false;
    }
  }

  // =========================================================
  // REGISTRATION REQUEST - ODOBRENJE
  // =========================================================

  async sendRegistrationApprovedEmail(
    email: string,
    firstName: string,
    organizationName: string,
    otp: string,
    userId: number,
  ) {
    try {
      const frontendUrl =
        this.configService.get<string>(
          'FRONTEND_URL',
        ) ||
        'http://localhost:5173';

      const activationUrl =
        `${frontendUrl}/verify-account?userId=${userId}`;

      const info =
        await this.transporter.sendMail({
          from:
            `"BoardFlow" <${this.configService.get<string>(
              'MAIL_USER',
            )}>`,

          to: email,

          subject:
            'Vaš BoardFlow nalog je odobren 🎉',

          text: `Zdravo ${firstName}!

Vaš zahtev za registraciju na BoardFlow je uspešno odobren. 🎉

Vaša organizacija: ${organizationName}

Vaš nalog je sada spreman za aktivaciju.

Da biste završili registraciju, potrebno je da potvrdite svoju email adresu.

Vaš verifikacioni kod je: ${otp}

Kod važi naredna 2 minuta.

Aktivaciju naloga možete izvršiti ovde:

${activationUrl}

Nakon uspešne verifikacije moći ćete da se prijavite na BoardFlow i počnete sa radom u svojoj organizaciji.

Ukoliko niste poslali ovaj zahtev, možete ignorisati ovu poruku.

Dobrodošli na BoardFlow! 🚀

BoardFlow tim`,
        });

      console.log(
        '📧 Email o odobrenju registracije poslat:',
        info.messageId,
      );

      return true;
    } catch (error) {
      console.error(
        '❌ Greška pri slanju emaila o odobrenju registracije:',
        error,
      );

      return false;
    }
  }

  // =========================================================
  // ORGANIZATION INVITATION
  // =========================================================

  async sendOrganizationInvitationEmail(
    email: string,
    roleName: string,
    token: string,
    expiresAt: Date,
  ) {
    try {
      const frontendUrl =
        this.configService.get<string>(
          'FRONTEND_URL',
        ) ||
        'http://localhost:5173';

      const invitationUrl =
        `${frontendUrl}/accept-invitation?token=${token}`;

      const formattedExpiration =
        expiresAt.toLocaleString(
          'sr-RS',
          {
            dateStyle: 'medium',
            timeStyle: 'short',
          },
        );

      const info =
        await this.transporter.sendMail({
          from:
            `"BoardFlow" <${this.configService.get<string>(
              'MAIL_USER',
            )}>`,

          to: email,

          subject:
            'Poziv da se pridružite BoardFlow organizaciji',

          text: `Zdravo! 👋

Pozvani ste da se pridružite organizaciji na BoardFlow platformi.

Dodeljena uloga:
${roleName}

Vaš poziv važi do:
${formattedExpiration}

Da biste prihvatili poziv, otvorite sledeći link:

${invitationUrl}

Nakon otvaranja linka potrebno je da se prijavite na BoardFlow nalog koji koristi ovu email adresu.

Ako niste očekivali ovaj poziv, možete ignorisati ovu poruku.

BoardFlow tim`,
        });

      console.log(
        '📧 Organization invitation email poslat:',
        info.messageId,
      );

      return true;
    } catch (error) {
      console.error(
        '❌ Greška pri slanju organization invitation emaila:',
        error,
      );

      return false;
    }
  }
}