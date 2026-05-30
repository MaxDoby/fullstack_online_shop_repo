export interface RawScrapedProduct {
  title: string;
  sourceUrl: string;
  sourceWebsite: string;
  priceText?: string;
  price?: number;
  manufacturerName?: string;
  categoryPath?: string[];
  description?: string;
  imageUrls?: string[];
  variants?: RawScrapedProductVariant[];
  specificationGroups?: RawScrapedSpecificationGroup[];
  externalId?: string;
  externalProductCode?: string;
  externalArticle?: string;
}

export interface RawScrapedProductVariant {
  name: string;
  value: string;
}

export interface RawScrapedSpecificationGroup {
  name: string;
  specifications: RawScrapedSpecification[];
}

export interface RawScrapedSpecification {
  name: string;
  value: string;
  unit?: string;
}
