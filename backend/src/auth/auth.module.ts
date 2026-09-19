import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailService } from './mail.service';

import { UsersModule } from '../users/users.module';
import { UserProfilesModule } from '../userprofiles/userprofiles.module';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';

import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';

import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),

    UsersModule,

    UserProfilesModule,

    PassportModule,

    ConfigModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (
        config: ConfigService,
      ) => ({
        secret:
          config.get<string>(
            'JWT_SECRET',
          ),

        signOptions: {
          expiresIn: '1d',
        },
      }),
    }),
  ],

  providers: [
    AuthService,
    MailService,
    JwtStrategy,
  ],

  controllers: [
    AuthController,
  ],

  exports: [
    MailService,
  ],
})
export class AuthModule {}