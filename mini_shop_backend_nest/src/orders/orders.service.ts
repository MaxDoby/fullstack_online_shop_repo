import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
// import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createOrderDto: CreateOrderDto) {
    const { items } = createOrderDto;
    const productIds = items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    if (products.length !== items.length)
      throw new NotFoundException('One or more products were not found.');

    const orderItemsData = items.map((item) => {
      const product = products.find((product) => product.id === item.productId);

      if (!product) throw new NotFoundException('Product not found.');

      return {
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: product.price,
      };
    });

    const totalCost = orderItemsData.reduce((suma, item) => {
      return suma + item.priceAtPurchase * item.quantity;
    }, 0);

    const order = await this.prisma.order.create({
      data: {
        userId,
        totalCost,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    return order;
  }

  findMyOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  //   findAll() {
  //     return `This action returns all orders`;
  //   }

  //   findOne(id: number) {
  //     return `This action returns a #${id} order`;
  //   }

  //   update(id: number, updateOrderDto: UpdateOrderDto) {
  //     return `This action updates a #${id} order`;
  //   }

  //   remove(id: number) {
  //     return `This action removes a #${id} order`;
  //   }
}
