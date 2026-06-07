import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../../core/storage/storage.module';
import { ProductsRepository } from './products.repository';

@Module({
  imports: [AuthModule, StorageModule],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
