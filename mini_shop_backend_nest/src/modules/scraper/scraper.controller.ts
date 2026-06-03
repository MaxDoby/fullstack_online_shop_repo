import {
  Body,
  Controller,
  Get,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StartScrapeJobDto } from './dto/start-scrape-job.dto';
import { ScraperService } from './scraper.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin/admin.guard';

@ApiBearerAuth()
@ApiTags('Scraper')
@Controller('scraper')
@UseGuards(JwtAuthGuard, AdminGuard)
export class ScraperController {
  public constructor(private readonly scraperService: ScraperService) {}

  @ApiOperation({
    summary: 'Start a new scraper job.',
    description:
      'Creates a scraper job and starts the scraping process asynchronously. The request defines the source website and optional filters such as product type, manufacturer, model, text search and price range.',
  })
  @ApiBody({ type: StartScrapeJobDto })
  @ApiResponse({ status: 201, description: 'Scraper job created and started.' })
  @ApiResponse({ status: 400, description: 'Invalid scraper job payload.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT token.' })
  @ApiResponse({ status: 403, description: 'Admin role is required.' })
  @Post('jobs')
  public startJob(@Body() body: StartScrapeJobDto) {
    return this.scraperService.startJob(body);
  }

  @ApiOperation({
    summary: 'Get scraper jobs.',
    description:
      'Returns the latest scraper jobs with status, counters and error message if a job failed or found no matching products.',
  })
  @ApiResponse({
    status: 200,
    description: 'Scraper jobs retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT token.' })
  @ApiResponse({ status: 403, description: 'Admin role is required.' })
  @Get('jobs')
  public findAllJobs() {
    return this.scraperService.findAllJobs();
  }

  @ApiOperation({
    summary: 'Get scraper job by id.',
    description:
      'Returns one scraper job by ID, including product source records connected to imported or updated products.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Scraper job ID.',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Scraper job retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT token.' })
  @ApiResponse({ status: 403, description: 'Admin role is required.' })
  @ApiResponse({ status: 404, description: 'Scraper job not found.' })
  @Get('jobs/:id')
  public findJobById(@Param('id', ParseIntPipe) id: number) {
    return this.scraperService.findJobById(id);
  }

  @ApiOperation({
    summary: 'Delete scraper job by id.',
    description:
      'Deletes a scraper job record. This action does not delete imported products.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Scraper job ID.',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Scraper job deleted successfully.',
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT token.' })
  @ApiResponse({ status: 403, description: 'Admin role is required.' })
  @ApiResponse({ status: 404, description: 'Scraper job not found.' })
  @Delete('jobs/:id')
  public deleteJob(@Param('id', ParseIntPipe) id: number) {
    return this.scraperService.deleteJob(id);
  }
}
