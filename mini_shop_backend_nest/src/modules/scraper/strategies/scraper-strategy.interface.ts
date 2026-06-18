export interface ProductUrlExtractionParams {
  html: string;
  baseUrl: string;
  query: string;
}

export interface ProductUrlExtractionStrategy {
  extractProductUrls(params: ProductUrlExtractionParams): string[];
}
