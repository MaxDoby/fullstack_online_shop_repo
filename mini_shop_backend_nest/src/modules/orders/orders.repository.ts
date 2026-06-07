import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public createOrder(userId: number, createOrderDto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const { items } = createOrderDto;
      const productIds = items.map((item) => item.productId);

      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
        },
      });

      if (products.length !== items.length) {
        throw new NotFoundException('One or more products were not found.');
      }

      const orderItemsData = items.map((item) => {
        const product = products.find(
          (product) => product.id === item.productId,
        );

        if (!product) {
          throw new NotFoundException('Product not found.');
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException('Not enough stock for product.');
        }

        return {
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: product.price,
        };
      });

      const totalCost = orderItemsData.reduce((sum, item) => {
        return sum + item.priceAtPurchase * item.quantity;
      }, 0);

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return tx.order.create({
        data: {
          userId,
          totalCost,
          status: 'PENDING',
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
    });
  }

  public findByUserId(userId: number) {
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
}
