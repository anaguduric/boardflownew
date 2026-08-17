import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { UserProfilesService } from './userprofiles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user-profiles')
export class UserProfilesController {
  constructor(private service: UserProfilesService) {}

  // ✅ Uzima trenutno ulogovanog korisnika iz tokena
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(@Req() req) {
    const userId = req.user.userId;

    const profile = await this.service.findByUserId(userId);

    return {
      bio: profile?.bio || "",
      profilePic: profile?.profilePic
        ? `data:image/jpeg;base64,${profile.profilePic.toString('base64')}`
        : null,

      position: profile?.position || '',
      organization: profile?.organization || '',
      department: profile?.department || '',
      teamLead: profile?.teamLead || '',
      workPhone: profile?.workPhone || '',
      startedAt: profile?.startedAt || null,

      country: profile?.country || '',
      city: profile?.city || '',
      address: profile?.address || '',

      languages: profile?.languages || '',
      programmingLanguages: profile?.programmingLanguages || '',
      skills: profile?.skills || '',
      certifications: profile?.certifications || '',

      driverLicense: profile?.driverLicense || false,

      offset: {
        x: profile?.offsetX ?? 0,
        y: profile?.offsetY ?? 0,
      },
      scale: profile?.scale ?? 1,
    };
  }

  // ✅ Update samo za ulogovanog usera
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMyProfile(@Req() req, @Body() body: any) {
    const userId = req.user.userId;

    const { offset, scale, profilePic, ...rest } = body;

    const dto: any = { ...rest };

    if (offset) {
      dto.offsetX = offset.x;
      dto.offsetY = offset.y;
    }
    if (scale !== undefined) {
      dto.scale = scale;
    }

    // profilePic dolazi sa frontenda kao base64 data-URL string
    // (npr. "data:image/png;base64,iVBORw0KG..."), a kolona u bazi
    // je 'longblob' — mora se konvertovati u pravi Buffer pre upisa,
    // inače se u bazu upiše nevalidan sadržaj i slika je "razbijena".
    if (profilePic) {
      const base64Data = profilePic.replace(/^data:image\/\w+;base64,/, '');
      dto.profilePic = Buffer.from(base64Data, 'base64');
    }

    await this.service.updateProfile(userId, dto);

    return { message: 'Profil uspešno ažuriran ✅' };
  }
}