import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { BaseRepository } from '../../core/database/repositories/base.repository';

@Injectable()
export class CategoriesRepository extends BaseRepository<
  PrismaService['category']
> {
  public constructor(prisma: PrismaService) {
    super(prisma.category);
  }
}
