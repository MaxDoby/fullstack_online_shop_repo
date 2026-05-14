import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(body: CreateUserDto) {
    const { password, ...userData } = body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
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
