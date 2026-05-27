import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../../core/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';
import { PageDto } from '../../common/dto/page.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllProducts(query: GetProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 8;
    const sortBy = query.sortBy ?? 'id';
    const sortOrder = query.sortOrder ?? 'asc';
    const skip = (page - 1) * limit;
    const { search, category } = query;
    const where: Prisma.ProductWhereInput = {};

    if (category) where.category = { name: category };

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // const items = await this.prisma.product.findMany({
    //   where,
    //   skip,
    //   take: limit,
    //   orderBy: { [sortBy]: sortOrder },
    // });

    // const total = await this.prisma.product.count({
    //   where,
    // });

    // const totalPages = Math.ceil(total / limit);

    // return { items, total, page, limit, totalPages };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
          productImages: {
            select: {
              id: true,
            },
            orderBy: {
              createdAt: 'asc',
            },
            take: 1,
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const meta = new PageMetaDto(total, page, limit);
    return new PageDto(items, meta);
  }

  async getProductById(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) throw new NotFoundException('Product not found by id.');
    return product;
  }

  createProduct(body: CreateProductDto) {
    const { category, ...productData } = body;
    const product = this.prisma.product.create({
      data: {
        ...productData,
        category: {
          connect: { name: category },
        },
      },
    });
    return product;
  }

  async updateProduct(id: number, body: UpdateProductDto) {
    const { category, ...productData } = body;

    const data: Prisma.ProductUpdateInput = {
      ...productData,
    };

    if (category) {
      data.category = {
        connect: {
          name: category,
        },
      };
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product) throw new NotFoundException('Product not found by id.');

    const updatedProduct = this.prisma.product.update({
      where: { id },
      data,
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
