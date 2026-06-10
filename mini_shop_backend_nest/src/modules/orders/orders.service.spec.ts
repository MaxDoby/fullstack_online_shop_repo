import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './orders.repository';

describe('OrdersService', () => {
  let ordersService: OrdersService;

  const ordersRepositoryMock = {
    createOrder: jest.fn(),
    findByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: OrdersRepository,
          useValue: ordersRepositoryMock,
        },
      ],
    }).compile();

    ordersService = module.get<OrdersService>(OrdersService);

    jest.clearAllMocks();
  });

  it('should create order and return mapped response.', async () => {
    const createOrderDto = {
      items: [
        {
          productId: 1,
          quantity: 2,
        },
      ],
    };

    const order = {
      id: 1,
      userId: 3,
      totalCost: 200,
      status: 'PENDING',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      orderItems: [
        {
          id: 10,
          productId: 1,
          quantity: 2,
          priceAtPurchase: 100,
          product: {
            title: 'Test Product',
            thumbnail: '/images/product/1/300/300',
          },
        },
      ],
    };

    ordersRepositoryMock.createOrder.mockResolvedValue(order);

    const result = await ordersService.create(3, createOrderDto);

    expect(ordersRepositoryMock.createOrder).toHaveBeenCalledWith(
      3,
      createOrderDto,
    );
    expect(result).toEqual({
      id: 1,
      userId: 3,
      totalCost: 200,
      status: 'PENDING',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      orderItems: [
        {
          id: 10,
          productId: 1,
          productTitle: 'Test Product',
          productThumbnail: '/images/product/1/300/300',
          quantity: 2,
          priceAtPurchase: 100,
        },
      ],
    });
  });

  it('should return authenticated user orders.', async () => {
    const orders = [
      {
        id: 1,
        userId: 3,
        totalCost: 200,
        status: 'PENDING',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        orderItems: [
          {
            id: 10,
            productId: 1,
            quantity: 2,
            priceAtPurchase: 100,
            product: {
              title: 'Test Product',
              thumbnail: '/images/product/1/300/300',
            },
          },
        ],
      },
    ];

    ordersRepositoryMock.findByUserId.mockResolvedValue(orders);

    const result = await ordersService.findMyOrders(3);

    expect(ordersRepositoryMock.findByUserId).toHaveBeenCalledWith(3);
    expect(result).toEqual([
      {
        id: 1,
        userId: 3,
        totalCost: 200,
        status: 'PENDING',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        orderItems: [
          {
            id: 10,
            productId: 1,
            productTitle: 'Test Product',
            productThumbnail: '/images/product/1/300/300',
            quantity: 2,
            priceAtPurchase: 100,
          },
        ],
      },
    ]);
  });
});
