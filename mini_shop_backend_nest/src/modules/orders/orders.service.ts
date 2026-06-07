import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderMapper } from './mappers/order.mapper';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersService {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async create(userId: number, createOrderDto: CreateOrderDto) {
    const order = await this.ordersRepository.createOrder(
      userId,
      createOrderDto,
    );

    return OrderMapper.toResponse(order);
  }

  async findMyOrders(userId: number) {
    const orders = await this.ordersRepository.findByUserId(userId);
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
