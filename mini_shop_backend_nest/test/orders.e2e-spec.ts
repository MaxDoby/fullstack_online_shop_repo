import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/prisma/prisma.service';

interface AuthE2EResponse {
  accessToken: string;
}

interface OrderE2EResponse {
  id: number;
  totalCost: number;
  orderItems: Array<{
    productId: number;
    quantity: number;
  }>;
}

describe('Orders E2E', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let httpServer: App;

  const testUser = {
    username: `e2e_order_user_${Date.now()}`,
    email: `e2e_order_${Date.now()}@example.com`,
    password: 'password123',
    firstName: 'E2E',
    lastName: 'Order',
  };

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

  it('should create order for authenticated user.', async () => {
    const registerResponse = await request(httpServer)
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    const registerBody = registerResponse.body as unknown as AuthE2EResponse;

    const category = await prismaService.category.upsert({
      where: { name: 'E2E Test Category' },
      update: {},
      create: { name: 'E2E Test Category' },
    });

    const availableProduct = await prismaService.product.create({
      data: {
        title: `E2E Order Product ${Date.now()}`,
        description: 'Product created for E2E order test.',
        price: 100,
        stock: 5,
        categoryId: category.id,
        thumbnail: '/images/e2e-product.jpg',
      },
    });

    const orderResponse = await request(httpServer)
      .post('/orders')
      .set('Authorization', `Bearer ${registerBody.accessToken}`)
      .send({
        items: [
          {
            productId: availableProduct.id,
            quantity: 1,
          },
        ],
      })
      .expect(201);

    const orderBody = orderResponse.body as unknown as OrderE2EResponse;

    expect(orderBody.id).toBeDefined();
    expect(orderBody.totalCost).toBeGreaterThan(0);
    expect(orderBody.orderItems).toHaveLength(1);
    expect(orderBody.orderItems[0].productId).toBe(availableProduct.id);
    expect(orderBody.orderItems[0].quantity).toBe(1);
  });
});
