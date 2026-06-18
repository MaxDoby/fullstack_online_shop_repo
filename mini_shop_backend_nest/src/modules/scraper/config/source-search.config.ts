import { Injectable } from '@nestjs/common';

const genericSearchPaths = [
  '/search',
  '/search/',
  '/cautare',
  '/catalogsearch/result/',
];

const genericSearchQueryParams = ['q', 'search', 'query', 'keywords'];

@Injectable()
export class SourceSearchConfigService {
  public buildSearchUrlCandidates(
    sourceBaseUrl: string,
    query: string,
  ): string[] {
    const baseUrl = new URL(sourceBaseUrl);
    const searchPaths = this.buildSearchPaths(baseUrl);

    return [
      ...new Set(
        searchPaths.flatMap((path) =>
          genericSearchQueryParams.map((queryParam) => {
            const searchUrl = new URL(path, baseUrl.origin);

            searchUrl.searchParams.set(queryParam, query);

            return searchUrl.href;
          }),
        ),
      ),
    ];
  }

  private buildSearchPaths(baseUrl: URL): string[] {
    const pathPrefix = baseUrl.pathname.replace(/\/$/, '');
    const prefixedPaths =
      pathPrefix && pathPrefix !== '/'
        ? genericSearchPaths.map((path) => `${pathPrefix}${path}`)
        : [];

    return [...prefixedPaths, ...genericSearchPaths];
  }
}
