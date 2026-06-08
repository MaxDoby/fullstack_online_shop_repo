import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { BaseRepository } from '../../core/database/repositories/base.repository';

@Injectable()
export class ImagesRepository extends BaseRepository<
  PrismaService['productImage']
> {
  public constructor(private readonly prisma: PrismaService) {
    super(prisma.productImage);
  }

  public findProductById(productId: number) {
    return this.prisma.product.findUnique({
      where: { id: productId },
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
}
