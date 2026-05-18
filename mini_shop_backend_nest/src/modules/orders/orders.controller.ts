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
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

interface JwtPayload {
  sub: number;
  username: string;
  email: string;
}

type AuthenticatedRequest = Request & {
  user: JwtPayload;
};

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create order.' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error.',
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid token.',
  })
  @ApiResponse({
    status: 404,
    description: 'One or more products were not found.',
  })
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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get authenticated user orders.' })
  @ApiResponse({
    status: 200,
    description: 'Get authenticated user orders.',
  })
  @ApiResponse({
    status: 401,
    description: 'Missing or invalid token.',
  })
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
