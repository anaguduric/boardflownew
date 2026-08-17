import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Povecanje dozvoljene velicine JSON zahteva
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ limit: '5mb', extended: true }));

  // Omogućava frontend-u na portu 5173 (Vite) da komunicira sa backend-om
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // Dobij UsersService iz NestJS DI
  const usersService = app.get(UsersService);

  // Proveri sve korisnike u bazi
  const users = await usersService.findAll(); // napravi ovu metodu u UsersService
  console.log('Trenutni korisnici:', users);

  await app.listen(3000);
}
bootstrap();
