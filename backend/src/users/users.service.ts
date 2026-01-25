import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  
  // Sve korisnike vrati
  async findAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  findByUsername(username: string) {
    return this.userRepo.findOne({ where: { username } });
  }

  findById(user_id: number) {
    return this.userRepo.findOne({ where: { user_id } });
  }

  create(user: Partial<User>) {
    return this.userRepo.save(user);
  }

  async update(user_id: number, data: Partial<User>) {
    await this.userRepo.update(user_id, data);
    return this.findById(user_id);
  }
  
}
