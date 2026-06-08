import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { BaseRepository } from '../../core/database/repositories/base.repository';

@Injectable()
export class UsersRepository extends BaseRepository<PrismaService['user']> {
  public constructor(private readonly prisma: PrismaService) {
    super(prisma.user);
  }

  public findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  public findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }
}
