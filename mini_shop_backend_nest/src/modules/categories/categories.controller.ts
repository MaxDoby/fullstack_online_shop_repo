import { Get, Controller } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoryResponseDto } from './dto/category-response.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Get all categories.' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully.',
    type: [CategoryResponseDto],
  })
  @Get()
  getCategories() {
    return this.categoriesService.getCategories();
  }
}
