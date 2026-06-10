import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/prisma/prisma.service';

interface ProductsE2EResponse {
  items: unknown[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

describe('Products E2E', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let httpServer: App;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    prismaService = app.get(PrismaService);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();

    httpServer = app.getHttpServer() as App;
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  it('should return paginated products.', async () => {
    const response = await request(httpServer)
      .get('/product?page=1&limit=8')
      .expect(200);

    const body = response.body as unknown as ProductsE2EResponse;

    expect(Array.isArray(body.items)).toBe(true);
    expect(body.meta.page).toBe(1);
    expect(body.meta.limit).toBe(8);
    expect(typeof body.meta.total).toBe('number');
    expect(typeof body.meta.totalPages).toBe('number');
    expect(typeof body.meta.hasNextPage).toBe('boolean');
    expect(typeof body.meta.hasPreviousPage).toBe('boolean');
  });
});
