import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';
import { StorageService } from '../../core/storage/storage.service';

describe('ProductsService', () => {
  let productsService: ProductsService;

  const productsRepositoryMock = {
    findDetailsById: jest.fn(),
    findUnique: jest.fn(),
    findPaginatedProducts: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    findActiveOrderItemByProductId: jest.fn(),
    findOrderItemByProductId: jest.fn(),
    softDeleteProduct: jest.fn(),
    findProductImages: jest.fn(),
    findSpecificationGroupIds: jest.fn(),
    hardDeleteProduct: jest.fn(),
  };

  const storageServiceMock = {
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: productsRepositoryMock,
        },
        {
          provide: StorageService,
          useValue: storageServiceMock,
        },
      ],
    }).compile();

    productsService = module.get<ProductsService>(ProductsService);

    jest.clearAllMocks();
  });

  it('should throw NotFoundException if product details are not found.', async () => {
    productsRepositoryMock.findDetailsById.mockResolvedValue(null);

    await expect(productsService.getProductById(1)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(productsRepositoryMock.findDetailsById).toHaveBeenCalledWith(1);
  });

  it('should return product details response if product exists.', async () => {
    const product = {
      id: 1,
      title: 'Test Product',
      description: 'Test description',
      price: 100,
      stock: 5,
      thumbnail: '/images/product/1/300/300',
      deletedAt: null,
      category: {
        id: 2,
        name: 'Phones',
      },
      productImages: [
        {
          id: 10,
        },
      ],
      manufacturer: {
        id: 3,
        name: 'Apple',
        slug: 'apple',
      },
      specificationGroups: [
        {
          id: 4,
          name: 'Display',
          order: 1,
          specifications: [
            {
              id: 5,
              name: 'Size',
              value: '6.1',
              unit: 'inch',
            },
          ],
        },
      ],
      variants: [
        {
          id: 6,
          name: 'Color',
          value: 'Black',
        },
      ],
      sources: [
        {
          id: 7,
          sourceWebsite: 'ultra.md',
          sourceUrl: 'https://ultra.md/product/test',
        },
      ],
    };

    productsRepositoryMock.findDetailsById.mockResolvedValue(product);

    const result = await productsService.getProductById(1);

    expect(productsRepositoryMock.findDetailsById).toHaveBeenCalledWith(1);
    expect(result).toEqual({
      id: 1,
      title: 'Test Product',
      description: 'Test description',
      price: 100,
      stock: 5,
      thumbnail: '/images/product/1/300/300',
      category: {
        id: 2,
        name: 'Phones',
      },
      productImages: [
        {
          id: 10,
        },
      ],
      manufacturer: {
        id: 3,
        name: 'Apple',
        slug: 'apple',
      },
      specificationGroups: [
        {
          id: 4,
          name: 'Display',
          order: 1,
          specifications: [
            {
              id: 5,
              name: 'Size',
              value: '6.1',
              unit: 'inch',
            },
          ],
        },
      ],
      variants: [
        {
          id: 6,
          name: 'Color',
          value: 'Black',
        },
      ],
      sources: [
        {
          id: 7,
          sourceWebsite: 'ultra.md',
          sourceUrl: 'https://ultra.md/product/test',
        },
      ],
    });
  });

  it('should return paginated products with default query values.', async () => {
    const products = [
      {
        id: 1,
        title: 'Test Product',
        description: 'Test description',
        price: 100,
        stock: 5,
        thumbnail: '/images/product/1/300/300',
        category: {
          id: 2,
          name: 'Phones',
        },
        productImages: [
          {
            id: 10,
          },
        ],
      },
    ];

    productsRepositoryMock.findPaginatedProducts.mockResolvedValue([
      products,
      1,
    ]);

    const result = await productsService.getAllProducts({});

    expect(productsRepositoryMock.findPaginatedProducts).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
      },
      skip: 0,
      limit: 16,
      sortBy: 'id',
      sortOrder: 'asc',
    });

    expect(result.items).toEqual([
      {
        id: 1,
        title: 'Test Product',
        description: 'Test description',
        price: 100,
        stock: 5,
        thumbnail: '/images/product/1/300/300',
        category: {
          id: 2,
          name: 'Phones',
        },
        productImages: [
          {
            id: 10,
          },
        ],
      },
    ]);

    expect(result.meta.total).toBe(1);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(16);
    expect(result.meta.totalPages).toBe(1);
    expect(result.meta.hasNextPage).toBe(false);
    expect(result.meta.hasPreviousPage).toBe(false);
  });

  it('should build filters and pagination params from query.', async () => {
    productsRepositoryMock.findPaginatedProducts.mockResolvedValue([[], 0]);

    await productsService.getAllProducts({
      page: 2,
      limit: 8,
      search: 'iphone',
      category: 'Phones',
      sortBy: 'price',
      sortOrder: 'desc',
    });

    expect(productsRepositoryMock.findPaginatedProducts).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        category: {
          name: 'Phones',
        },
        OR: [
          {
            title: {
              contains: 'iphone',
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: 'iphone',
              mode: 'insensitive',
            },
          },
        ],
      },
      skip: 8,
      limit: 8,
      sortBy: 'price',
      sortOrder: 'desc',
    });
  });

  it('should throw NotFoundException when deleting missing product.', async () => {
    productsRepositoryMock.findUnique.mockResolvedValue(null);

    await expect(productsService.deleteProduct(1)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(productsRepositoryMock.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should throw BadRequestException when product exists in active orders.', async () => {
    productsRepositoryMock.findUnique.mockResolvedValue({
      id: 1,
      title: 'Test Product',
      deletedAt: null,
    });

    productsRepositoryMock.findActiveOrderItemByProductId.mockResolvedValue({
      id: 10,
      productId: 1,
    });

    await expect(productsService.deleteProduct(1)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(productsRepositoryMock.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });

    expect(
      productsRepositoryMock.findActiveOrderItemByProductId,
    ).toHaveBeenCalledWith(1);
  });

  it('should soft delete product when it exists only in order history.', async () => {
    productsRepositoryMock.findUnique.mockResolvedValue({
      id: 1,
      title: 'Test Product',
      deletedAt: null,
    });

    productsRepositoryMock.findActiveOrderItemByProductId.mockResolvedValue(
      null,
    );

    productsRepositoryMock.findOrderItemByProductId.mockResolvedValue({
      id: 20,
      productId: 1,
    });

    productsRepositoryMock.softDeleteProduct.mockResolvedValue({
      id: 1,
      title: 'Test Product',
    });

    const result = await productsService.deleteProduct(1);

    expect(productsRepositoryMock.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });

    expect(
      productsRepositoryMock.findActiveOrderItemByProductId,
    ).toHaveBeenCalledWith(1);

    expect(
      productsRepositoryMock.findOrderItemByProductId,
    ).toHaveBeenCalledWith(1);

    expect(productsRepositoryMock.softDeleteProduct).toHaveBeenCalledWith(1);

    expect(result).toEqual({
      message: 'Product removed from catalog successfully.',
      product: 'Test Product',
    });
  });

  it('should hard delete product when it has no order history.', async () => {
    productsRepositoryMock.findUnique.mockResolvedValue({
      id: 1,
      title: 'Test Product',
      deletedAt: null,
    });

    productsRepositoryMock.findActiveOrderItemByProductId.mockResolvedValue(
      null,
    );
    productsRepositoryMock.findOrderItemByProductId.mockResolvedValue(null);

    productsRepositoryMock.findProductImages.mockResolvedValue([
      {
        id: 10,
        storageKey: 'products/1/test-image.jpg',
      },
    ]);

    productsRepositoryMock.findSpecificationGroupIds.mockResolvedValue([
      {
        id: 100,
      },
      {
        id: 101,
      },
    ]);

    productsRepositoryMock.hardDeleteProduct.mockResolvedValue({
      id: 1,
      title: 'Test Product',
    });

    const result = await productsService.deleteProduct(1);

    expect(productsRepositoryMock.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });

    expect(
      productsRepositoryMock.findActiveOrderItemByProductId,
    ).toHaveBeenCalledWith(1);

    expect(
      productsRepositoryMock.findOrderItemByProductId,
    ).toHaveBeenCalledWith(1);

    expect(productsRepositoryMock.findProductImages).toHaveBeenCalledWith(1);

    expect(storageServiceMock.deleteFile).toHaveBeenCalledWith(
      'products/1/test-image.jpg',
    );

    expect(
      productsRepositoryMock.findSpecificationGroupIds,
    ).toHaveBeenCalledWith(1);

    expect(productsRepositoryMock.hardDeleteProduct).toHaveBeenCalledWith({
      productId: 1,
      specificationGroupIds: [100, 101],
    });

    expect(result).toEqual({
      message: 'Product deleted successfully.',
      product: 'Test Product',
    });
  });
});
