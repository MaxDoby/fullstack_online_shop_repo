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
import { Roles } from '../../common/decorators/roles.decorator';
import { ScrapeJobResponseDto } from './dto/scrape-job-response.dto';
import {
  SourceProfilePreviewRequestDto,
  SourceProfilePreviewResponseDto,
} from './dto/source-profile-preview.dto';
import {
  SaveSourceProfileDto,
  SourceProfileResponseDto,
} from './dto/source-profile.dto';

@ApiBearerAuth()
@ApiTags('Scraper')
@Controller('scraper')
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, AdminGuard)
export class ScraperController {
  public constructor(private readonly scraperService: ScraperService) {}

  @ApiOperation({
    summary: 'Start a new scraper job.',
    description:
      'Creates a scraper job and starts the scraping process asynchronously. The request defines the source website and optional filters such as product type, manufacturer, model, text search and price range.',
  })
  @ApiBody({ type: StartScrapeJobDto })
  @ApiResponse({
    status: 201,
    description: 'Scraper job created and started.',
    type: ScrapeJobResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid scraper job payload.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT token.' })
  @ApiResponse({ status: 403, description: 'Admin role is required.' })
  @Post('jobs')
  public startJob(@Body() body: StartScrapeJobDto) {
    return this.scraperService.startJob(body);
  }

  @ApiOperation({
    summary: 'Preview source profile from a real search URL.',
    description:
      'Detects a reusable search URL template and product URL candidates from a manually copied source search URL. This helps configure a new source without hardcoding search paths in code.',
  })
  @ApiBody({ type: SourceProfilePreviewRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Source profile preview generated successfully.',
    type: SourceProfilePreviewResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid source profile payload.' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT token.' })
  @ApiResponse({ status: 403, description: 'Admin role is required.' })
  @Post('source-profile/preview')
  public previewSourceProfile(@Body() body: SourceProfilePreviewRequestDto) {
    return this.scraperService.previewSourceProfile(body);
  }

  @ApiOperation({
    summary: 'Save or update a reusable scraper source profile.',
    description: 'Creates a reusable source profile from a real search URL.',
  })
  @ApiBody({ type: SaveSourceProfileDto })
  @ApiResponse({
    status: 201,
    description: 'Source profile saved successfully.',
    type: SourceProfileResponseDto,
  })
  @Post('source-profiles')
  public saveSourceProfile(@Body() body: SaveSourceProfileDto) {
    return this.scraperService.saveSourceProfile(body);
  }

  @ApiOperation({
    summary: 'Get saved scraper source profiles.',
    description: 'Returns active source profiles available for scraper jobs.',
  })
  @ApiResponse({
    status: 200,
    description: 'Source profiles retrieved successfully.',
    type: [SourceProfileResponseDto],
  })
  @Get('source-profiles')
  public findAllSourceProfiles() {
    return this.scraperService.findAllSourceProfiles();
  }

  @ApiOperation({
    summary: 'Get scraper jobs.',
    description:
      'Returns the latest scraper jobs with status, counters and error message if a job failed or found no matching products.',
  })
  @ApiResponse({
    status: 200,
    description: 'Scraper jobs retrieved successfully.',
    type: [ScrapeJobResponseDto],
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
    type: ScrapeJobResponseDto,
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
    type: ScrapeJobResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT token.' })
  @ApiResponse({ status: 403, description: 'Admin role is required.' })
  @ApiResponse({ status: 404, description: 'Scraper job not found.' })
  @Delete('jobs/:id')
  public deleteJob(@Param('id', ParseIntPipe) id: number) {
    return this.scraperService.deleteJob(id);
  }
}
