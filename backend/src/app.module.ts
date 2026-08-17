import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { UserProfilesModule } from './userprofiles/userprofiles.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),  // .env globalno
    TypeOrmModule.forRoot({                     // konekcija na MySQL
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: false, // u produkciji stavi false
      //logging: ['query', 'error', 'schema'],
    }),
    UsersModule,
    UserProfilesModule,
    AuthModule,
  ],
})
export class AppModule {}
