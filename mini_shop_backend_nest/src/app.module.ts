import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './modules/products/products.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ImagesModule } from './modules/images/images.module';
import { StorageModule } from './core/storage/storage.module';
import { ScraperModule } from './modules/scraper/scraper.module';

@Module({
  imports: [
    ProductsModule,
    PrismaModule,
    CategoriesModule,
    UsersModule,
    AuthModule,
    OrdersModule,
    ImagesModule,
    StorageModule,
    ScraperModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
