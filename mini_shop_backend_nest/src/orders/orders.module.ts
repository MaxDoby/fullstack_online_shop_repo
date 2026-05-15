import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [AuthModule],
})
export class OrdersModule {}
