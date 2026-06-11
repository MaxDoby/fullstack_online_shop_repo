import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/prisma/prisma.service';
import type { App } from 'supertest/types';

interface AuthE2EResponse {
  accessToken: string;
}

interface ProductE2EResponse {
  id: number;
  title: string;
  price: number;
  stock: number;
  category: {
    name: string;
  };
}

describe('Admin-product E2E', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let httpServer: App;
  let adminEmail: string;
  let createdProductId: number | null = null;
  let createdCategoryId: number | null = null;
  const testCategoryName = `E2E Category ${Date.now()}`;

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

  it('should create product as admin.', async () => {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await prismaService.user.create({
      data: {
        username: `admin_e2e_${Date.now()}`,
        email: `admin_e2e_${Date.now()}@example.com`,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'E2E',
        role: 'ADMIN',
      },
    });

    const category = await prismaService.category.upsert({
      where: { name: testCategoryName },
      update: {},
      create: { name: testCategoryName },
    });
    createdCategoryId = category.id;

    const loginResponse = await request(httpServer)
      .post('/auth/login')
      .send({
        identifier: adminUser.email,
        password,
      })
      .expect(200);

    const loginBody = loginResponse.body as unknown as AuthE2EResponse;

    const createProductResponse = await request(httpServer)
      .post('/product')
      .set('Authorization', `Bearer ${loginBody.accessToken}`)
      .send({
        title: 'E2E Admin Product',
        description: 'Product created from admin E2E test.',
        price: 999.99,
        stock: 5,
        category: category.name,
        thumbnail: '/images/products/e2e-admin-product.webp',
      })
      .expect(201);

    adminEmail = adminUser.email;

    const productBody =
      createProductResponse.body as unknown as ProductE2EResponse;
    createdProductId = productBody.id;

    expect(productBody.title).toBe('E2E Admin Product');
    expect(productBody.price).toBe(999.99);
    expect(productBody.stock).toBe(5);
    expect(productBody.category.name).toBe(category.name);
  });

  afterAll(async () => {
    if (createdProductId) {
      await prismaService.product.deleteMany({
        where: { id: createdProductId },
      });
    }

    if (createdCategoryId) {
      await prismaService.category.deleteMany({
        where: { id: createdCategoryId },
      });
    }

    await prismaService.user.deleteMany({
      where: { email: adminEmail },
    });

    await prismaService.$disconnect();
    await app.close();
  });
});
