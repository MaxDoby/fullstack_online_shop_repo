import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { NewsItemResponseDto } from './dto/news-item-response.dto';

@ApiTags('News')
@Controller('news')
export class NewsController {
  public constructor(private readonly newsService: NewsService) {}

  @ApiOperation({ summary: 'Get latest technology news for frontend ticker.' })
  @ApiResponse({
    status: 200,
    description: 'Technology news retrieved successfully.',
    type: [NewsItemResponseDto],
  })
  @ApiResponse({
    status: 503,
    description: 'News API key is not configured.',
  })
  @Get()
  public getTechNews(): Promise<NewsItemResponseDto[]> {
    return this.newsService.getTechNews();
  }
}
