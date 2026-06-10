import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/prisma/prisma.service';
import type { App } from 'supertest/types';

interface AuthE2EResponse {
  user: {
    email: string;
  };
  accessToken: string;
}

interface CurrentUserE2EResponse {
  email: string;
}

describe('Auth E2E', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let httpServer: App;

  const testUser = {
    username: `e2e_user_${Date.now()}`,
    email: `e2e_${Date.now()}@example.com`,
    password: 'password123',
    firstName: 'E2E',
    lastName: 'User',
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

  it('should register, login and get current user.', async () => {
    const registerResponse = await request(httpServer)
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    const registerBody = registerResponse.body as unknown as AuthE2EResponse;

    expect(registerBody.user.email).toBe(testUser.email);
    expect(registerBody.accessToken).toBeDefined();

    const loginResponse = await request(httpServer)
      .post('/auth/login')
      .send({
        identifier: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    const loginBody = loginResponse.body as unknown as AuthE2EResponse;

    expect(loginBody.user.email).toBe(testUser.email);
    expect(loginBody.accessToken).toBeDefined();

    const meResponse = await request(httpServer)
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginBody.accessToken}`)
      .expect(200);

    const meBody = meResponse.body as unknown as CurrentUserE2EResponse;

    expect(meBody.email).toBe(testUser.email);
  });

  it('should return 401 when current user request has no token.', async () => {
    await request(httpServer).get('/auth/me').expect(401);
  });
});
