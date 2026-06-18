export interface DiscoveredSourceProfile {
  sourceBaseUrl: string;
  exampleSearchUrl: string;
  exampleSearchTerm: string;
  searchUrlTemplate: string;
  productUrlCandidates: string[];
  confidenceScore: number;
  productLinkSelector?: string;
}
