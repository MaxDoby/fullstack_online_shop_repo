import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { BaseRepository } from '../../core/database/repositories/base.repository';

@Injectable()
export class ProductsRepository extends BaseRepository<
  PrismaService['product']
> {
  public constructor(private readonly prisma: PrismaService) {
    super(prisma.product);
  }

  public findPaginatedProducts(params: {
    where: Prisma.ProductWhereInput;
    skip: number;
    limit: number;
    sortBy: 'title' | 'price' | 'stock' | 'id';
    sortOrder: 'asc' | 'desc';
  }) {
    const { where, skip, limit, sortBy, sortOrder } = params;

    return this.prisma.$transaction([
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
  }

  public findDetailsById(id: number) {
    return this.prisma.product.findUnique({
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
  }

  public createProduct(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({
      data,
      include: {
        category: true,
        productImages: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  public updateProduct(id: number, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        productImages: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  public findActiveOrderItemByProductId(productId: number) {
    return this.prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          status: {
            in: ['PENDING', 'PROCESSING'],
          },
        },
      },
    });
  }

  public findOrderItemByProductId(productId: number) {
    return this.prisma.orderItem.findFirst({
      where: { productId },
    });
  }

  public softDeleteProduct(id: number) {
    return this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  public findProductImages(productId: number) {
    return this.prisma.productImage.findMany({
      where: { productId },
    });
  }

  public findSpecificationGroupIds(productId: number) {
    return this.prisma.productSpecificationGroup.findMany({
      where: { productId },
      select: { id: true },
    });
  }

  public hardDeleteProduct(params: {
    productId: number;
    specificationGroupIds: number[];
  }) {
    const { productId, specificationGroupIds } = params;

    return this.prisma.$transaction(async (tx) => {
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
        where: { productId },
      });

      await tx.productVariant.deleteMany({
        where: { productId },
      });

      await tx.productSource.deleteMany({
        where: { productId },
      });

      await tx.productImage.deleteMany({
        where: { productId },
      });

      return tx.product.delete({
        where: { id: productId },
      });
    });
  }
}
