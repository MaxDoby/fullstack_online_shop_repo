export interface NormalizedProduct {
  title: string;
  description: string;
  price: number;
  stock: number;
  categoryName: string;
  thumbnail: string;
  manufacturerName?: string;
  sourceWebsite: string;
  sourceUrl: string;
  externalId?: string;
  externalProductCode?: string;
  externalArticle?: string;
  externalHash?: string;
  images: NormalizedProductImage[];
  variants: NormalizedProductVariant[];
  specificationGroups: NormalizedSpecificationGroup[];
}

export interface NormalizedProductImage {
  url: string;
  originalName?: string;
  isPrimary: boolean;
}

export interface NormalizedProductVariant {
  name: string;
  value: string;
}

export interface NormalizedSpecificationGroup {
  name: string;
  order?: number;
  specifications: NormalizedSpecification[];
}

export interface NormalizedSpecification {
  name: string;
  value: string;
  unit?: string;
}
