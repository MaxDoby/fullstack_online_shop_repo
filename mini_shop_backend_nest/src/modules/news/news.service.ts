import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { NewsItemResponseDto } from './dto/news-item-response.dto';

interface GNewsArticle {
  title: string;
  url: string;
  source: {
    name: string;
  };
}

interface GNewsResponse {
  articles: GNewsArticle[];
}

@Injectable()
export class NewsService {
  public constructor(private readonly configService: ConfigService) {}

  public async getTechNews(): Promise<NewsItemResponseDto[]> {
    const apiKey = this.configService.get<string>('GNEWS_API_KEY');

    if (!apiKey) {
      throw new ServiceUnavailableException('News API key is not configured.');
    }

    const params = new URLSearchParams({
      category: 'technology',
      lang: 'en',
      max: '10',
      apikey: apiKey,
    });

    const response = await axios.get<GNewsResponse>(
      `https://gnews.io/api/v4/top-headlines?${params.toString()}`,
    );

    return response.data.articles.map((article) => ({
      title: article.title,
      url: article.url,
      source: article.source.name,
    }));
  }
}
