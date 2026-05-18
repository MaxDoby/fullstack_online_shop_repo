import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateUserData } from './interfaces/create-user-data.interface';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(body: CreateUserData) {
    const user = await this.prisma.user.create({
      data: body,
    });
    return user;
  }

  async findByEmail(email: string) {
    const findUserByEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    return findUserByEmail;
  }

  async findById(id: number) {
    const findUserById = await this.prisma.user.findUnique({
      where: { id },
    });
    return findUserById;
  }

  async findByUsername(username: string) {
    const findUserByUsername = await this.prisma.user.findUnique({
      where: { username },
    });
    return findUserByUsername;
  }
}
