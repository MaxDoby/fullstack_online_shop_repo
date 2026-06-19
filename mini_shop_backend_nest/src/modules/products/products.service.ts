import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';
import { PageDto } from '../../common/dto/page.dto';
import { StorageService } from '../../core/storage/storage.service';
import { ProductMapper } from './mappers/product.mapper';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly storageService: StorageService,
    private readonly productsRepository: ProductsRepository,
  ) {}

  async getAllProducts(query: GetProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 16;
    const sortBy = query.sortBy ?? 'id';
    const sortOrder = query.sortOrder ?? 'desc';
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

    const [items, total] = await this.productsRepository.findPaginatedProducts({
      where,
      skip,
      limit,
      sortBy,
      sortOrder,
    });

    const meta = new PageMetaDto(total, page, limit);
    const mappedItems = ProductMapper.toResponseList(items);

    return new PageDto(mappedItems, meta);
  }

  async getProductById(id: number) {
    const product = await this.productsRepository.findDetailsById(id);

    if (!product || product.deletedAt)
      throw new NotFoundException('Product not found by id.');

    return ProductMapper.toDetailsResponse(product);
  }

  async createProduct(body: CreateProductDto) {
    const { category, ...productData } = body;
    const data: Prisma.ProductCreateInput = {
      ...productData,
      category: {
        connect: { name: category },
      },
    };

    const product = await this.productsRepository.createProduct(data);

    return ProductMapper.toResponse(product);
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

    const product = await this.productsRepository.findUnique({
      where: { id },
    });

    if (!product || product.deletedAt)
      throw new NotFoundException('Product not found by id.');

    const updatedProduct = await this.productsRepository.updateProduct(
      id,
      data,
    );

    return ProductMapper.toResponse(updatedProduct);
  }

  async deleteProduct(id: number) {
    const product = await this.productsRepository.findUnique({
      where: { id: id },
    });

    if (!product || product.deletedAt)
      throw new NotFoundException('Product not found by id.');

    const activeOrderItem =
      await this.productsRepository.findActiveOrderItemByProductId(id);

    if (activeOrderItem) {
      throw new BadRequestException(
        'Product cannot be deleted because it exists in active orders.',
      );
    }

    const orderItem =
      await this.productsRepository.findOrderItemByProductId(id);

    if (orderItem) {
      const deletedProduct =
        await this.productsRepository.softDeleteProduct(id);

      return {
        message: 'Product removed from catalog successfully.',
        product: deletedProduct.title,
      };
    }

    const productImages = await this.productsRepository.findProductImages(id);

    for (const image of productImages) {
      await this.storageService.deleteFile(image.storageKey);
    }

    const specificationGroups =
      await this.productsRepository.findSpecificationGroupIds(id);

    const specificationGroupIds = specificationGroups.map((group) => group.id);

    const deletedProduct = await this.productsRepository.hardDeleteProduct({
      productId: id,
      specificationGroupIds,
    });

    return {
      message: 'Product deleted successfully.',
      product: deletedProduct.title,
    };
  }
}
