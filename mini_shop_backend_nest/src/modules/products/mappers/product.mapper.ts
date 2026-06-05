import type { ProductResponseDto } from '../dto/product-response.dto';
import type { ProductDetailsResponseDto } from '../dto/product-details-response.dto';

type ProductWithRelations = {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  thumbnail: string;
  category: {
    id: number;
    name: string;
  };
  productImages: {
    id: number;
  }[];
};

type ProductDetailsWithRelations = ProductWithRelations & {
  manufacturer: {
    id: number;
    name: string;
    slug: string;
  } | null;
  specificationGroups: {
    id: number;
    name: string;
    order: number | null;
    specifications: {
      id: number;
      name: string;
      value: string;
      unit: string | null;
    }[];
  }[];
  variants: {
    id: number;
    name: string;
    value: string;
  }[];
  sources: {
    id: number;
    sourceWebsite: string;
    sourceUrl: string;
  }[];
};

export class ProductMapper {
  public static toResponse(product: ProductWithRelations): ProductResponseDto {
    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      stock: product.stock,
      thumbnail: product.thumbnail,
      category: {
        id: product.category.id,
        name: product.category.name,
      },
      productImages: product.productImages.map((image) => ({
        id: image.id,
      })),
    };
  }

  public static toResponseList(
    products: ProductWithRelations[],
  ): ProductResponseDto[] {
    return products.map((product) => this.toResponse(product));
  }

  public static toDetailsResponse(
    product: ProductDetailsWithRelations,
  ): ProductDetailsResponseDto {
    return {
      ...this.toResponse(product),
      manufacturer: product.manufacturer
        ? {
            id: product.manufacturer.id,
            name: product.manufacturer.name,
            slug: product.manufacturer.slug,
          }
        : null,
      specificationGroups: product.specificationGroups.map((group) => ({
        id: group.id,
        name: group.name,
        order: group.order ?? 0,
        specifications: group.specifications.map((specification) => ({
          id: specification.id,
          name: specification.name,
          value: specification.value,
          unit: specification.unit,
        })),
      })),
      variants: product.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        value: variant.value,
      })),
      sources: product.sources.map((source) => ({
        id: source.id,
        sourceWebsite: source.sourceWebsite,
        sourceUrl: source.sourceUrl,
      })),
    };
  }
}
