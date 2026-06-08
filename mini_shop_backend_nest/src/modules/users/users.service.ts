import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserData } from './interfaces/create-user-data.interface';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(data: CreateUserData) {
    return this.usersRepository.create({ data });
  }

  async findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: number) {
    return this.usersRepository.findUnique({
      where: { id },
    });
  }

  async findByUsername(username: string) {
    return this.usersRepository.findByUsername(username);
  }
}
