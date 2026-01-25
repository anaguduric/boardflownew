import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
