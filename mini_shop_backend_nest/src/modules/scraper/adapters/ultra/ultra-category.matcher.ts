const LAPTOP_CATEGORY_KEYWORDS = [
  'laptopuri',
  'laptop',
  'laptops',
  'notebook',
  'notebooks',
];
const STRICT_LAPTOP_TITLE_KEYWORDS = ['laptop', 'notebook'];
const PHONE_CATEGORY_KEYWORDS = [
  'telefoane',
  'telefon',
  'telephones',
  'smartphone',
  'smartphones',
];
const LAPTOP_NEGATIVE_CATEGORY_KEYWORDS = [
  'desktop',
  'desktops',
  'cooling',
  'cooler',
  'pad',
  'pads',
  'adapters',
  'adapter',
  'adaptor',
  'adaptoare',
  'bags',
  'bag',
  'geanta',
  'genti',
  'rucsac',
  'incarcator',
  'alimentator',
  'suport',
  'stand',
  'husa',
  'cablu',
  'dock',
  'docking',
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  laptop: LAPTOP_CATEGORY_KEYWORDS,
  laptops: LAPTOP_CATEGORY_KEYWORDS,
  notebook: LAPTOP_CATEGORY_KEYWORDS,
  notebooks: LAPTOP_CATEGORY_KEYWORDS,
  phone: PHONE_CATEGORY_KEYWORDS,
  phones: PHONE_CATEGORY_KEYWORDS,
  audio: ['audio', 'casti', 'boxe'],
  accessories: ['accesorii', 'accessories'],
  tablet: ['tablete', 'tablet', 'tablets'],
  tablets: ['tablete', 'tablet', 'tablets'],
};

const NEGATIVE_CATEGORY_KEYWORDS: Record<string, string[]> = {
  laptop: LAPTOP_NEGATIVE_CATEGORY_KEYWORDS,
  laptops: LAPTOP_NEGATIVE_CATEGORY_KEYWORDS,
  notebook: LAPTOP_NEGATIVE_CATEGORY_KEYWORDS,
  notebooks: LAPTOP_NEGATIVE_CATEGORY_KEYWORDS,
};

export function findBestUltraCategoryUrl(
  categoryUrls: string[],
  productType?: string,
): string | null {
  const keywords = getUltraCategoryKeywords(productType);

  if (keywords.length === 0) return null;

  const negativeKeywords = getUltraNegativeCategoryKeywords(productType);

  const scoredCategories = categoryUrls
    .map((categoryUrl) => {
      const normalizedUrl = normalizeForUltraMatch(categoryUrl);
      const urlSegments = normalizedUrl.split('/').filter(Boolean);
      const lastSegment = urlSegments.at(-1) ?? '';

      let score = 0;

      for (const keyword of keywords) {
        if (lastSegment === keyword) score += 100;
        if (lastSegment.includes(keyword)) score += 30;
        if (normalizedUrl.includes(keyword)) score += 10;
      }

      for (const negativeKeyword of negativeKeywords) {
        if (lastSegment.includes(negativeKeyword)) score -= 80;
        if (normalizedUrl.includes(negativeKeyword)) score -= 20;
      }

      return { categoryUrl, score };
    })
    .filter((category) => category.score > 0)
    .sort((a, b) => b.score - a.score);

  return scoredCategories[0]?.categoryUrl ?? null;
}

export function matchesUltraRequestedCategory(
  categoryPath: string[],
  requestedCategory?: string,
): boolean {
  if (!requestedCategory) return true;

  const normalizedCategoryText = normalizeForUltraMatch(categoryPath.join(' '));
  const keywords = getUltraCategoryKeywords(requestedCategory);
  const negativeKeywords = getUltraNegativeCategoryKeywords(requestedCategory);

  const hasPositiveMatch = keywords.some((keyword) =>
    normalizedCategoryText.includes(keyword),
  );
  const hasNegativeMatch = negativeKeywords.some((keyword) =>
    normalizedCategoryText.includes(keyword),
  );

  return hasPositiveMatch && !hasNegativeMatch;
}

export function matchesUltraRequestedProduct(
  title: string,
  categoryPath: string[],
  requestedCategory?: string,
): boolean {
  if (!matchesUltraRequestedCategory(categoryPath, requestedCategory)) {
    return false;
  }

  if (!isLaptopRequest(requestedCategory)) return true;

  const normalizedTitle = normalizeForUltraMatch(title);
  const hasStrictLaptopTitle = STRICT_LAPTOP_TITLE_KEYWORDS.some((keyword) =>
    normalizedTitle.includes(keyword),
  );
  const hasAccessoryTitle = LAPTOP_NEGATIVE_CATEGORY_KEYWORDS.some((keyword) =>
    normalizedTitle.includes(keyword),
  );

  return hasStrictLaptopTitle && !hasAccessoryTitle;
}

function getUltraCategoryKeywords(productType?: string): string[] {
  if (!productType) return [];

  const normalizedProductType = normalizeForUltraMatch(productType);

  return CATEGORY_KEYWORDS[normalizedProductType] ?? [normalizedProductType];
}

function getUltraNegativeCategoryKeywords(productType?: string): string[] {
  if (!productType) return [];

  const normalizedProductType = normalizeForUltraMatch(productType);

  return NEGATIVE_CATEGORY_KEYWORDS[normalizedProductType] ?? [];
}

function normalizeForUltraMatch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function isLaptopRequest(productType?: string): boolean {
  if (!productType) return false;

  return ['laptop', 'laptops', 'notebook', 'notebooks'].includes(
    normalizeForUltraMatch(productType),
  );
}
