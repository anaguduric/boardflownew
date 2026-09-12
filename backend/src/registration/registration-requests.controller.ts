import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { RegistrationRequestsService } from './registration-requests.service';
import { CreateRegistrationRequestDto } from './dto/create-registration-request.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('registration-requests')
export class RegistrationRequestsController {
  constructor(
    private readonly registrationRequestsService: RegistrationRequestsService,
  ) {}

  // --------------------------------------------------
  // KORISNIK - SLANJE ZAHTEVA
  // --------------------------------------------------

  @Post()
  async createRequest(
    @Body() dto: CreateRegistrationRequestDto,
  ) {
    return this.registrationRequestsService.createRequest(dto);
  }

  // --------------------------------------------------
  // ADMIN - SVI ZAHTEVI
  // --------------------------------------------------

  @UseGuards(JwtAuthGuard)
  @Get()
  async getRequests() {
    return this.registrationRequestsService.getRequests();
  }

  // --------------------------------------------------
  // ADMIN - ODOBRAVANJE
  // --------------------------------------------------

  @UseGuards(JwtAuthGuard)
  @Patch(':id/approve')
  async approveRequest(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.registrationRequestsService.approveRequest(
      id,
      req.user.userId,
    );
  }

  // --------------------------------------------------
  // ADMIN - ODBIJANJE
  // --------------------------------------------------

  @UseGuards(JwtAuthGuard)
  @Patch(':id/reject')
  async rejectRequest(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() body: { reason?: string },
  ) {
    return this.registrationRequestsService.rejectRequest(
      id,
      req.user.userId,
      body?.reason,
    );
  }
}