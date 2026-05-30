import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StartScrapeJobDto } from './dto/start-scrape-job.dto';
import { ScraperService } from './scraper.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin/admin.guard';

@ApiTags('Scraper')
@Controller('scraper')
@UseGuards(JwtAuthGuard, AdminGuard)
export class ScraperController {
  public constructor(private readonly scraperService: ScraperService) {}

  @Post('jobs')
  @ApiOperation({ summary: 'Start a new scraper job.' })
  public startJob(@Body() body: StartScrapeJobDto) {
    return this.scraperService.startJob(body);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Get scraper jobs.' })
  public findAllJobs() {
    return this.scraperService.findAllJobs();
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get scraper job by id.' })
  public findJobById(@Param('id', ParseIntPipe) id: number) {
    return this.scraperService.findJobById(id);
  }
}
