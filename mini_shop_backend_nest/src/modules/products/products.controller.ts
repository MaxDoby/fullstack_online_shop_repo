import {
  Controller,
  Get,
  Body,
  Post,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductsPageResponseDto } from './dto/products-page-response.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @ApiOperation({ summary: 'Get all products.' })
  @ApiResponse({
    status: 200,
    description: 'Products list retrieved successfully.',
    type: ProductsPageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters.',
  })
  @Get()
  getAllProducts(@Query() query: GetProductsQueryDto) {
    return this.productService.getAllProducts(query);
  }

  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Product ID.',
    example: 1,
  })
  @ApiOperation({ summary: 'Get product by ID.' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found.',
  })
  @Get(':id')
  getProductById(@Param('id') id: string) {
    return this.productService.getProductById(Number(id));
  }

  @ApiOperation({ summary: 'Create product.' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error.',
  })
  @Post()
  createProduct(@Body() body: CreateProductDto) {
    return this.productService.createProduct(body);
  }

  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Product ID.',
    example: 1,
  })
  @ApiOperation({ summary: 'Update product.' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error.',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found.',
  })
  @Put(':id')
  updateProduct(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.productService.updateProduct(Number(id), body);
  }

  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Product ID.',
    example: 1,
  })
  @ApiOperation({ summary: 'Delete product.' })
  @ApiResponse({
    status: 200,
    description: 'Product deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found.',
  })
  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return this.productService.deleteProduct(Number(id));
  }
}
