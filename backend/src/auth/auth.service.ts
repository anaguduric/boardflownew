import { ConflictException, Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // -----------------------------
  // REGISTRACIJA
  // -----------------------------
  async register(username: string, email: string, password: string) {
    //const userExists = await this.usersService.findByEmail(email);
    //if (userExists) throw new ConflictException('Korisnik već postoji');
    //Ovo ispraviti

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expiry = new Date(Date.now() + 2 * 60 * 1000);

    const user = await this.usersService.create({
      username,
      email,
      password: hashedPassword,
      otp,
      otp_expiry,
      status: 'unverified',
      role_id: 2,
    });

    if (!user) {
  throw new Error('Korisnik nije sačuvan u bazi');
}

    await this.sendOTPEmail(email, otp);

    return { message: 'Uspešno registrovan, OTP poslat', userId: user.user_id };
  }

  // -----------------------------
  // SLANJE OTP EMAILA
  // -----------------------------
  private async sendOTPEmail(email: string, otp: string) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'boardflow10@gmail.com',
        pass: 'epsq likk uure rbze',
      },
    });

    await transporter.sendMail({
      from: '"BoardFlow" <boardflow10@gmail.com>',
      to: email,
      subject: 'Projekat Eagle v2',
      text: `Testiranje sistema`
      //text: `Zdravo! 👋\n\nVaš kod za verifikaciju naloga je: ${otp}.\nKod ističe za 2 minuta.\n\nAko niste vi tražili ovaj kod, slobodno ignorišite ovu poruku.`,
    });

    console.log('OTP poslat na email:', email);
  }

  // -----------------------------
  // VERIFIKACIJA OTP
  // -----------------------------
  async verifyOtp(userId: number, otp: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('Korisnik ne postoji');

    if (user.otp !== otp) throw new UnauthorizedException('Pogrešan OTP');
    if (!user.otp_expiry || new Date() > new Date(user.otp_expiry)) {
      throw new UnauthorizedException('OTP je istekao');
    }

    user.status = 'verified';
    user.otp = null;
    user.otp_expiry = null;

    await this.usersService.update(userId, user);

    return { message: 'Korisnik je verifikovan' };
  }

  // -----------------------------
  // PONOVNO SLANJE OTP
  // -----------------------------
  async resendOtp(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('Korisnik ne postoji');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otp_expiry = new Date(Date.now() + 2 * 60 * 1000);

    await this.usersService.update(userId, user);

    await this.sendOTPEmail(user.email, otp);

    return { message: 'Novi OTP poslat!' };
  }

  // -----------------------------
  // LOGIN - EMAIL
  // -----------------------------
  async login(email: string, password: string) {
  const user = await this.usersService.findByEmail(email);
  if (!user) throw new UnauthorizedException('Pogrešan email');

  // PHP $2y$ → Node $2b$ konverzija
  const hash = user.password.startsWith('$2y$') ? '$2b$' + user.password.slice(4) : user.password;

  const isMatch = await bcrypt.compare(password, hash);
  if (!isMatch) throw new UnauthorizedException('Pogrešna lozinka');

  const token = this.jwtService.sign({ sub: user.user_id });

  return {
    message: 'Uspešna prijava',
    token,
    user: { id: user.user_id, username: user.username, email: user.email },
  };
}


  // -----------------------------
  // LOGIN - USERNAME (opcionalno)
  // -----------------------------
  async loginByUsername(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new UnauthorizedException('Korisnik nije pronađen');

    let hash = user.password;
    if (hash.startsWith('$2y$')) {
      hash = '$2b$' + hash.slice(4);
    }

    const isMatch = await bcrypt.compare(password, hash);
    if (!isMatch) throw new UnauthorizedException('Pogrešna lozinka');

    if (user.status !== 'verified') {
      throw new UnauthorizedException('Nalog nije verifikovan');
    }

    const token = this.jwtService.sign({ sub: user.user_id });

    return {
      message: 'Uspešna prijava',
      token,
      user: { id: user.user_id, username: user.username, email: user.email },
    };
  }
}
