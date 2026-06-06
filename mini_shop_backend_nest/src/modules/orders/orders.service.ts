import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
// import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../../core/prisma/prisma.service';
import { OrderMapper } from './mappers/order.mapper';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createOrderDto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const { items } = createOrderDto;
      const productIds = items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
        },
      });

      if (products.length !== items.length)
        throw new NotFoundException('One or more products were not found.');

      const orderItemsData = items.map((item) => {
        const product = products.find(
          (product) => product.id === item.productId,
        );

        if (!product) throw new NotFoundException('Product not found.');

        if (product.stock < item.quantity)
          throw new BadRequestException('Not enough stock for product.');

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

      const order = await tx.order.create({
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

      return OrderMapper.toResponse(order);
    });
  }

  async findMyOrders(userId: number) {
    const orders = await this.prisma.order.findMany({
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
    return OrderMapper.toResponseList(orders);
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
