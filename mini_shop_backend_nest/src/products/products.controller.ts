import {
  Controller,
  Get,
  Body,
  Post,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './create.product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Get()
  getAllProducts() {
    return this.productService.getAllProducts();
  }

  @Get('categories')
  getAllCategories() {
    return this.productService.getAllCategories();
  }

  @Get(':id')
  getProductById(@Param('id') id: string) {
    return this.productService.getProductById(Number(id));
  }

  @Post()
  createProduct(@Body() body: CreateProductDto) {
    return this.productService.createProduct(body);
  }

  @Put(':id')
  updateProduct(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.productService.updateProduct(Number(id), body);
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(Number(id));
  }
}
