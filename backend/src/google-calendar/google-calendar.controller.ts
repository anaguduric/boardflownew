import {
  Controller,
  Get,
  Query,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { GoogleCalendarService } from './google-calendar.service';
import { GoogleCalendarToken } from './google-calendar-token.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('google-calendar')
export class GoogleCalendarController {
  constructor(
    private readonly googleCalendarService: GoogleCalendarService,

    @InjectRepository(GoogleCalendarToken)
    private readonly googleCalendarTokenRepository: Repository<GoogleCalendarToken>,
  ) {}

  /**
   * Vraća Google OAuth URL.
   */
  @Get('auth')
  @UseGuards(JwtAuthGuard)
  getAuthUrl(@Req() req: Request) {
    const user = req.user as { userId: number };

    const url = this.googleCalendarService.getAuthUrl(
      user.userId,
    );

    return {
      url,
    };
  }

  /**
   * Proverava da li je trenutni korisnik
   * povezao Google Calendar.
   */
  @Get('status')
  @UseGuards(JwtAuthGuard)
  async getStatus(@Req() req: Request) {
    const user = req.user as { userId: number };

    const connected =
      await this.googleCalendarService.isConnected(
        user.userId,
      );

    return {
      connected,
    };
  }

  /**
   * Vraća događaje iz Google Calendar-a
   * za trenutno ulogovanog korisnika.
   */
  @Get('events')
  @UseGuards(JwtAuthGuard)
  async getEvents(@Req() req: Request) {
    const user = req.user as { userId: number };

    const googleToken =
      await this.googleCalendarTokenRepository.findOne({
        where: {
          user_id: user.userId,
        },
      });

    if (!googleToken) {
      return {
        events: [],
      };
    }

    const events =
      await this.googleCalendarService.getEvents(
        {
          access_token: googleToken.access_token,
          refresh_token: googleToken.refresh_token,
        },
      );

    return {
      events,
    };
  }

  /**
   * Google OAuth callback.
   */
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    if (!code) {
      return res
        .status(400)
        .send('Google authorization code is missing');
    }

    if (!state) {
      return res
        .status(400)
        .send('User identification is missing');
    }

    try {
      const userId = Number(state);

      if (!userId) {
        return res
          .status(400)
          .send('Invalid user identification');
      }

      const tokens =
        await this.googleCalendarService.getTokens(code);

      await this.googleCalendarService.saveTokens(
        userId,
        tokens,
      );

      return res.send(`
        <h2>Google Calendar successfully connected!</h2>
        <p>You can close this window and return to BoardFlow.</p>
      `);
    } catch (error) {
      console.error(
        'Google Calendar authorization error:',
        error,
      );

      return res
        .status(500)
        .send('Failed to connect Google Calendar');
    }
  }
}