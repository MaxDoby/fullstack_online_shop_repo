import {
  Controller,
  Get,
  Post,
  Body,
  //   Patch,
  //   Param,
  //   Delete,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
// import { UpdateOrderDto } from './dto/update-order.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';

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
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const userId = user.sub;
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
  findMyOrders(@CurrentUser() user: AuthenticatedUser) {
    const userId = user.sub;
    return this.ordersService.findMyOrders(userId);
  }
}
