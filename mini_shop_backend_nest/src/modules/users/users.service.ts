import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserData } from './interfaces/create-user-data.interface';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(data: CreateUserData) {
    return await this.usersRepository.createUser(data);
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findByEmail(email);
  }

  async findById(id: number) {
    return await this.usersRepository.findById(id);
  }

  async findByUsername(username: string) {
    return await this.usersRepository.findByUsername(username);
  }
}
