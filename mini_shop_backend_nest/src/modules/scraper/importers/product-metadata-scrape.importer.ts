import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { NormalizedProduct } from '../interfaces/normalized-product.interface';
import { Prisma } from '@prisma/client';

type PrismaTransactionClient = Prisma.TransactionClient | PrismaService;

@Injectable()
export class ProductMetadataScrapeImporter {
  public constructor(private readonly prisma: PrismaService) {}

  public async importMetadata(
    productId: number,
    product: NormalizedProduct,
    prismaClient: PrismaTransactionClient = this.prisma,
  ) {
    await this.replaceVariants(productId, product, prismaClient);
    await this.replaceSpecificationGroups(productId, product, prismaClient);
  }

  private async replaceVariants(
    productId: number,
    product: NormalizedProduct,
    prismaClient: PrismaTransactionClient,
  ) {
    await prismaClient.productVariant.deleteMany({
      where: { productId },
    });

    if (product.variants.length === 0) return;

    await prismaClient.productVariant.createMany({
      data: product.variants.map((variant) => ({
        productId,
        name: variant.name,
        value: variant.value,
      })),
    });
  }

  private async replaceSpecificationGroups(
    productId: number,
    product: NormalizedProduct,
    prismaClient: PrismaTransactionClient,
  ) {
    const existingGroups =
      await prismaClient.productSpecificationGroup.findMany({
        where: { productId },
        select: { id: true },
      });
    const existingGroupIds = existingGroups.map((group) => group.id);

    if (existingGroupIds.length > 0) {
      await prismaClient.productSpecification.deleteMany({
        where: { groupId: { in: existingGroupIds } },
      });
    }

    await prismaClient.productSpecificationGroup.deleteMany({
      where: { productId },
    });

    for (const [index, group] of product.specificationGroups.entries()) {
      await prismaClient.productSpecificationGroup.create({
        data: {
          productId,
          name: group.name,
          order: group.order ?? index,
          specifications: {
            create: group.specifications.map((specification) => ({
              name: specification.name,
              value: specification.value,
              unit: specification.unit,
            })),
          },
        },
      });
    }
  }
}
