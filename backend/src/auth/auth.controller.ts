import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.username,
      registerDto.email,
      registerDto.password,
    );
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { userId: number; otp: string }) {
    return this.authService.verifyOtp(body.userId, body.otp);
  }

  @Post('resend-otp')
  async resendOtp(@Body() body: { userId: number }) {
    return this.authService.resendOtp(body.userId);
  }
 
  @Post('login')
async login(@Body() loginDto: LoginDto) {
  // ovo sada uzima email i password iz DTO-a
  return this.authService.login(loginDto.email, loginDto.password);
}

}
