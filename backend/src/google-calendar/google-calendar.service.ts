import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { google, calendar_v3 } from 'googleapis';
import { GoogleCalendarToken } from './google-calendar-token.entity';

@Injectable()
export class GoogleCalendarService {
  private readonly clientId = process.env.GOOGLE_CLIENT_ID;
  private readonly clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  private readonly redirectUri = process.env.GOOGLE_REDIRECT_URI;

  constructor(
    @InjectRepository(GoogleCalendarToken)
    private readonly googleCalendarTokenRepository: Repository<GoogleCalendarToken>,
  ) {}

  /**
   * Kreira OAuth2 klijent.
   */
  private createOAuth2Client() {
    return new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri,
    );
  }

  /**
   * Generiše URL preko kog korisnik povezuje
   * svoj Google Calendar sa BoardFlow aplikacijom.
   */
  getAuthUrl(userId: number): string {
    const oauth2Client = this.createOAuth2Client();

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      state: String(userId),
      scope: [
        'https://www.googleapis.com/auth/calendar',
      ],
    });
  }

  /**
   * Menja authorization code koji Google šalje
   * nakon uspešnog povezivanja za access i refresh tokene.
   */
  async getTokens(code: string) {
    const oauth2Client = this.createOAuth2Client();

    const { tokens } = await oauth2Client.getToken(code);

    return tokens;
  }

  /**
   * Čuva Google Calendar tokene za konkretnog BoardFlow korisnika.
   */
  async saveTokens(
    userId: number,
    tokens: {
      access_token?: string | null;
      refresh_token?: string | null;
      expiry_date?: number | null;
    },
  ) {
    let googleToken =
      await this.googleCalendarTokenRepository.findOne({
        where: {
          user_id: userId,
        },
      });

    if (googleToken) {
      googleToken.access_token = tokens.access_token ?? '';
      googleToken.expiry_date = tokens.expiry_date ?? null;

      if (tokens.refresh_token) {
        googleToken.refresh_token = tokens.refresh_token;
      }
    } else {
      googleToken = this.googleCalendarTokenRepository.create({
        user_id: userId,
        access_token: tokens.access_token ?? '',
        refresh_token: tokens.refresh_token ?? null,
        expiry_date: tokens.expiry_date ?? null,
      });
    }

    return this.googleCalendarTokenRepository.save(googleToken);
  }

  /**
   * Kreira Google Calendar klijent koristeći
   * tokene konkretnog korisnika.
   */
  private createCalendarClient(tokens: {
    access_token?: string | null;
    refresh_token?: string | null;
    expiry_date?: number | null;
    token_type?: string | null;
    scope?: string | null;
  }) {
    const oauth2Client = this.createOAuth2Client();

    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
      token_type: tokens.token_type,
      scope: tokens.scope ?? undefined,
    });

    return google.calendar({
      version: 'v3',
      auth: oauth2Client,
    });
  }

  /**
   * Vraća listu korisnikovih kalendara.
   */
  async getCalendars(tokens: {
    access_token?: string | null;
    refresh_token?: string | null;
  }) {
    const calendar = this.createCalendarClient(tokens);

    const response = await calendar.calendarList.list();

    return response.data.items ?? [];
  }

  /**
   * Vraća događaje iz korisnikovog glavnog kalendara.
   */
  async getEvents(
    tokens: {
      access_token?: string | null;
      refresh_token?: string | null;
    },
    timeMin?: string,
    timeMax?: string,
  ) {
    const calendar = this.createCalendarClient(tokens);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items ?? [];
  }

  /**
   * Kreira novi događaj u Google Calendar-u.
   */
  async createEvent(
    tokens: {
      access_token?: string | null;
      refresh_token?: string | null;
    },
    event: calendar_v3.Schema$Event,
  ) {
    const calendar = this.createCalendarClient(tokens);

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return response.data;
  }

  /**
   * Izmenjuje postojeći događaj.
   */
  async updateEvent(
    tokens: {
      access_token?: string | null;
      refresh_token?: string | null;
    },
    eventId: string,
    event: calendar_v3.Schema$Event,
  ) {
    const calendar = this.createCalendarClient(tokens);

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId,
      requestBody: event,
    });

    return response.data;
  }

  /**
   * Briše događaj iz Google Calendar-a.
   */
  async deleteEvent(
    tokens: {
      access_token?: string | null;
      refresh_token?: string | null;
    },
    eventId: string,
  ) {
    const calendar = this.createCalendarClient(tokens);

    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });

    return {
      success: true,
      message: 'Event successfully deleted',
    };
  }

  /**
   * Vraća jedan konkretan događaj.
   */
  async getEvent(
    tokens: {
      access_token?: string | null;
      refresh_token?: string | null;
    },
    eventId: string,
  ) {
    const calendar = this.createCalendarClient(tokens);

    const response = await calendar.events.get({
      calendarId: 'primary',
      eventId,
    });

    return response.data;
  }

  /**
   * Proverava da li je korisnik povezao Google Calendar.
   */
  async isConnected(userId: number): Promise<boolean> {
    const token =
      await this.googleCalendarTokenRepository.findOne({
        where: {
          user_id: userId,
        },
      });

    return !!token;
  }
}