import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';
import { PrismaService } from './core/prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('health')
  async getHealth(@Res() res: Response) {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return res.status(HttpStatus.OK).json({
        api: { status: 'up' },
        database: { status: 'up' },
      });
    } catch {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        api: { status: 'up' },
        database: { status: 'down' },
      });
    }
  }
}
