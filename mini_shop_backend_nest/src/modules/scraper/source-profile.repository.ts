import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import type { SaveSourceProfileDto } from './dto/source-profile.dto';
import type { DiscoveredSourceProfile } from './interfaces/source-profile.interface';

@Injectable()
export class SourceProfileRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public findManyActive() {
    return this.prisma.scraperSourceProfile.findMany({
      where: { isActive: true },
      orderBy: { sourceWebsite: 'asc' },
    });
  }

  public findActiveBySource(params: {
    sourceWebsite: string;
    sourceBaseUrl: string;
  }) {
    return this.prisma.scraperSourceProfile.findUnique({
      where: {
        sourceWebsite_sourceBaseUrl: {
          sourceWebsite: params.sourceWebsite,
          sourceBaseUrl: params.sourceBaseUrl,
        },
      },
    });
  }

  public upsertFromDiscoveredProfile(params: {
    body: SaveSourceProfileDto;
    discoveredProfile: DiscoveredSourceProfile;
  }) {
    const { body, discoveredProfile } = params;

    return this.prisma.scraperSourceProfile.upsert({
      where: {
        sourceWebsite_sourceBaseUrl: {
          sourceWebsite: body.sourceWebsite,
          sourceBaseUrl: body.sourceBaseUrl,
        },
      },
      update: {
        exampleSearchUrl: discoveredProfile.exampleSearchUrl,
        exampleSearchTerm: body.exampleSearchTerm,
        searchUrlTemplate: discoveredProfile.searchUrlTemplate,
        productLinkSelector: discoveredProfile.productLinkSelector,
        productUrlCandidates: discoveredProfile.productUrlCandidates,
        confidenceScore: discoveredProfile.confidenceScore,
        isActive: body.isActive ?? true,
      },
      create: {
        sourceWebsite: body.sourceWebsite,
        sourceBaseUrl: body.sourceBaseUrl,
        exampleSearchUrl: discoveredProfile.exampleSearchUrl,
        exampleSearchTerm: body.exampleSearchTerm,
        searchUrlTemplate: discoveredProfile.searchUrlTemplate,
        productLinkSelector: discoveredProfile.productLinkSelector,
        productUrlCandidates: discoveredProfile.productUrlCandidates,
        confidenceScore: discoveredProfile.confidenceScore,
        isActive: body.isActive ?? true,
      },
    });
  }
}
