import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './create.product.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllProducts() {
    return await this.prisma.product.findMany();
  }

  async getAllCategories() {
    const products = await this.getAllProducts();

    const uniqueCategories = [
      ...new Set(products.map((product) => product.category)),
    ];
    return uniqueCategories;
  }

  async getProductById(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) throw new NotFoundException('Product not found by id.');
    return product;
  }

  createProduct(body: CreateProductDto) {
    const product = this.prisma.product.create({ data: body });
    return product;
  }

  async updateProduct(id: number, body: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) throw new NotFoundException('Product not found by id.');
    const updatedProduct = this.prisma.product.update({
      where: { id },
      data: body,
    });
    return updatedProduct;
  }

  async deleteProduct(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) throw new NotFoundException('Product not found by id.');

    const deletedProduct = await this.prisma.product.delete({
      where: { id },
    });
    return {
      message: 'Product deleted successfully.',
      product: deletedProduct.title,
    };
  }
}
