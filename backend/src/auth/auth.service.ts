import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';

import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from './mail.service';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  // ============================================================
  // REGISTRACIJA
  // ============================================================

  async register(
    username: string,
    email: string,
    password: string,
  ) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const otp_expiry = new Date(
      Date.now() + 2 * 60 * 1000,
    );

    const user = await this.usersService.create({
      username,
      email,
      password: hashedPassword,
      otp,
      otp_expiry,
      status: 'unverified',
      role_id: 4,
    });

    if (!user) {
      throw new Error(
        'Korisnik nije sačuvan u bazi',
      );
    }

    await this.mailService.sendOtp(
      email,
      otp,
    );

    return {
      message: 'Uspešno registrovan, OTP poslat',
      userId: user.user_id,
    };
  }

  // ============================================================
  // VERIFIKACIJA OTP
  // ============================================================

  async verifyOtp(
    userId: number,
    otp: string,
  ) {
    const user =
      await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException(
        'Korisnik ne postoji',
      );
    }

    if (user.otp !== otp) {
      throw new UnauthorizedException(
        'Pogrešan OTP',
      );
    }

    if (
      !user.otp_expiry ||
      new Date() > new Date(user.otp_expiry)
    ) {
      throw new UnauthorizedException(
        'OTP je istekao',
      );
    }

    user.status = 'verified';
    user.otp = null;
    user.otp_expiry = null;

    await this.usersService.update(
      userId,
      user,
    );

    return {
      message: 'Korisnik je verifikovan',
    };
  }

  // ============================================================
  // PONOVNO SLANJE OTP
  // ============================================================

  async resendOtp(userId: number) {
    const user =
      await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException(
        'Korisnik ne postoji',
      );
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    user.otp = otp;

    user.otp_expiry = new Date(
      Date.now() + 2 * 60 * 1000,
    );

    await this.usersService.update(
      userId,
      user,
    );

    await this.mailService.sendOtp(
      user.email,
      otp,
    );

    return {
      message: 'Novi OTP poslat!',
    };
  }

  // ============================================================
  // LOGIN - EMAIL
  // ============================================================

  async login(
    email: string,
    password: string,
  ) {
    const user =
      await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(
        'Pogrešan email',
      );
    }

    // PHP $2y$ → Node $2b$
    const hash =
      user.password.startsWith('$2y$')
        ? '$2b$' + user.password.slice(4)
        : user.password;

    const isMatch =
      await bcrypt.compare(
        password,
        hash,
      );

    if (!isMatch) {
      throw new UnauthorizedException(
        'Pogrešna lozinka',
      );
    }

    // Korisnik mora biti verifikovan
    if (user.status !== 'verified') {
      throw new UnauthorizedException(
        'Nalog nije verifikovan. Proverite email i unesite OTP kod.',
      );
    }

    const token =
      this.jwtService.sign({
        sub: user.user_id,
      });

    return {
      message: 'Uspešna prijava',

      token,

      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
      },
    };
  }

  // ============================================================
  // LOGIN - USERNAME
  // ============================================================

  async loginByUsername(
    username: string,
    password: string,
  ) {
    const user =
      await this.usersService.findByUsername(
        username,
      );

    if (!user) {
      throw new UnauthorizedException(
        'Korisnik nije pronađen',
      );
    }

    let hash = user.password;

    // PHP $2y$ → Node $2b$
    if (hash.startsWith('$2y$')) {
      hash = '$2b$' + hash.slice(4);
    }

    const isMatch =
      await bcrypt.compare(
        password,
        hash,
      );

    if (!isMatch) {
      throw new UnauthorizedException(
        'Pogrešna lozinka',
      );
    }

    if (user.status !== 'verified') {
      throw new UnauthorizedException(
        'Nalog nije verifikovan',
      );
    }

    const token =
      this.jwtService.sign({
        sub: user.user_id,
      });

    return {
      message: 'Uspešna prijava',

      token,

      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
      },
    };
  }
}