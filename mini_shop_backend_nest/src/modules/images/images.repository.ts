import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class ImagesRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public findProductById(productId: number) {
    return this.prisma.product.findUnique({
      where: {
        id: productId,
      },
    });
  }

  public createProductImage(data: Prisma.ProductImageCreateInput) {
    return this.prisma.productImage.create({
      data,
    });
  }

  public findProductImages(productId: number) {
    return this.prisma.productImage.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' },
    });
  }

  public findImageById(imageId: number) {
    return this.prisma.productImage.findUnique({
      where: { id: imageId },
    });
  }

  public setPrimaryImage(params: { imageId: number; productId: number }) {
    const { imageId, productId } = params;

    return this.prisma.$transaction(async (tx) => {
      await tx.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });

      return tx.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      });
    });
  }

  public deleteImage(imageId: number) {
    return this.prisma.productImage.delete({
      where: { id: imageId },
    });
  }
}
