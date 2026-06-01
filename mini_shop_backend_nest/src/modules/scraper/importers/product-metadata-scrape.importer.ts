import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import type { NormalizedProduct } from '../interfaces/normalized-product.interface';

@Injectable()
export class ProductMetadataScrapeImporter {
  public constructor(private readonly prisma: PrismaService) {}

  public async importMetadata(productId: number, product: NormalizedProduct) {
    await this.replaceVariants(productId, product);
    await this.replaceSpecificationGroups(productId, product);
  }

  private async replaceVariants(productId: number, product: NormalizedProduct) {
    await this.prisma.productVariant.deleteMany({
      where: { productId },
    });

    if (product.variants.length === 0) return;

    await this.prisma.productVariant.createMany({
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
  ) {
    const existingGroups = await this.prisma.productSpecificationGroup.findMany(
      {
        where: { productId },
        select: { id: true },
      },
    );
    const existingGroupIds = existingGroups.map((group) => group.id);

    if (existingGroupIds.length > 0) {
      await this.prisma.productSpecification.deleteMany({
        where: { groupId: { in: existingGroupIds } },
      });
    }

    await this.prisma.productSpecificationGroup.deleteMany({
      where: { productId },
    });

    for (const [index, group] of product.specificationGroups.entries()) {
      await this.prisma.productSpecificationGroup.create({
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
