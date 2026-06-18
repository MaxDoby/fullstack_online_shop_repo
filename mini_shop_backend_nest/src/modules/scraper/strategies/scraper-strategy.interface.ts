export interface ProductUrlExtractionParams {
  html: string;
  baseUrl: string;
  query: string;
  productLinkSelector?: string;
}

export interface ProductUrlExtractionStrategy {
  extractProductUrls(params: ProductUrlExtractionParams): string[];
}
