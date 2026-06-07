import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateUserData } from './interfaces/create-user-data.interface';

@Injectable()
export class UsersRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public createUser(body: CreateUserData) {
    return this.prisma.user.create({
      data: body,
    });
  }

  public findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  public findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  public findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }
}
