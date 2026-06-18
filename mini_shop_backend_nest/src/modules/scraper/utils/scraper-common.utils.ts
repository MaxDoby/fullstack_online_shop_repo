export const normalizeForSearch = (value: string): string => {
  return Array.from(value.normalize('NFD').toLowerCase())
    .filter((char) => {
      const code = char.charCodeAt(0);

      return code < 0x0300 || code > 0x036f;
    })
    .join('')
    .replaceAll('-', ' ')
    .replaceAll('_', ' ')
    .replaceAll('/', ' ');
};

export const toSearchTokens = (value: string): string[] => {
  return normalizeForSearch(value)
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((word) => word.length > 0);
};

export const parsePriceText = (priceText: string): number | undefined => {
  const normalizedPrice = priceText.replace(/[^\d.,]/g, '').replace(',', '.');
  const price = Number(normalizedPrice);

  return Number.isFinite(price) && price > 0 ? price : undefined;
};

export const hasProductPathSignal = (pathname: string): boolean => {
  const path = pathname.toLowerCase();

  return (
    path.includes('/product') ||
    path.includes('/products') ||
    path.includes('/produs') ||
    path.includes('/pd/') ||
    path.includes('/p/') ||
    path.endsWith('.html')
  );
};

export const chunkArray = <T>(items: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }

  return chunks;
};
