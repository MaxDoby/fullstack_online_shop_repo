import {
  Controller,
  Get,
  Post,
  Body,
  //   Patch,
  //   Param,
  //   Delete,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
// import { UpdateOrderDto } from './dto/update-order.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { Request } from 'express';

interface JwtPayload {
  sub: number;
  username: string;
  email: string;
}

type AuthenticatedRequest = Request & {
  user: JwtPayload;
};

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const userId = request.user.sub;
    return this.ordersService.create(userId, createOrderDto);
  }

  //   @Get()
  //   findAll() {
  //     return this.ordersService.findAll();
  //   }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMyOrders(@Req() request: AuthenticatedRequest) {
    const userId = request.user.sub;
    return this.ordersService.findMyOrders(userId);
  }

  //   @Get(':id')
  //   findOne(@Param('id') id: string) {
  //     return this.ordersService.findOne(+id);
  //   }

  //   @Patch(':id')
  //   update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
  //     return this.ordersService.update(+id, updateOrderDto);
  //   }

  //   @Delete(':id')
  //   remove(@Param('id') id: string) {
  //     return this.ordersService.remove(+id);
  //   }
}
