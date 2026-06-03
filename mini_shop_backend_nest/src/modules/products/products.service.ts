import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../../core/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';
import { PageDto } from '../../common/dto/page.dto';
import { StorageService } from '../../core/storage/storage.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async getAllProducts(query: GetProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 16;
    const sortBy = query.sortBy ?? 'id';
    const sortOrder = query.sortOrder ?? 'asc';
    const skip = (page - 1) * limit;
    const { search, category } = query;
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
    };

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
        orderBy: [{ stock: 'desc' }, { [sortBy]: sortOrder }],
        include: {
          category: true,
          manufacturer: true,
          productImages: {
            select: {
              id: true,
              isPrimary: true,
            },
            orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
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
      include: {
        category: true,
        manufacturer: true,
        productImages: {
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
        },
        specificationGroups: {
          orderBy: [{ order: 'asc' }, { id: 'asc' }],
          include: {
            specifications: {
              orderBy: { id: 'asc' },
            },
          },
        },
        variants: {
          orderBy: { id: 'asc' },
        },
        sources: {
          orderBy: { lastScrapedAt: 'desc' },
        },
      },
    });
    if (!product || product.deletedAt)
      throw new NotFoundException('Product not found by id.');
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
      include: {
        category: true,
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
    if (!product || product.deletedAt)
      throw new NotFoundException('Product not found by id.');

    const updatedProduct = this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
    return updatedProduct;
  }

  async deleteProduct(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!product || product.deletedAt)
      throw new NotFoundException('Product not found by id.');

    const activeOrderItem = await this.prisma.orderItem.findFirst({
      where: {
        productId: id,
        order: {
          status: {
            in: ['PENDING', 'PROCESSING'],
          },
        },
      },
    });

    if (activeOrderItem) {
      throw new BadRequestException(
        'Product cannot be deleted because it exists in active orders.',
      );
    }

    const orderItem = await this.prisma.orderItem.findFirst({
      where: { productId: id },
    });

    if (orderItem) {
      const deletedProduct = await this.prisma.product.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      return {
        message: 'Product removed from catalog successfully.',
        product: deletedProduct.title,
      };
    }

    const productImages = await this.prisma.productImage.findMany({
      where: { productId: id },
    });

    for (const image of productImages) {
      await this.storageService.deleteFile(image.storageKey);
    }

    const specificationGroups =
      await this.prisma.productSpecificationGroup.findMany({
        where: { productId: id },
        select: { id: true },
      });

    const specificationGroupIds = specificationGroups.map((group) => group.id);

    const deletedProduct = await this.prisma.$transaction(async (tx) => {
      if (specificationGroupIds.length > 0) {
        await tx.productSpecification.deleteMany({
          where: {
            groupId: {
              in: specificationGroupIds,
            },
          },
        });
      }

      await tx.productSpecificationGroup.deleteMany({
        where: { productId: id },
      });

      await tx.productVariant.deleteMany({
        where: { productId: id },
      });

      await tx.productSource.deleteMany({
        where: { productId: id },
      });

      await tx.productImage.deleteMany({
        where: { productId: id },
      });

      return tx.product.delete({
        where: { id },
      });
    });

    return {
      message: 'Product deleted successfully.',
      product: deletedProduct.title,
    };
  }
}
