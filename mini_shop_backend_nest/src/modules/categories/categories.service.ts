import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CategoryMapper } from './mappers/category.mapper';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async getCategories() {
    const categories = await this.categoriesRepository.findMany({
      orderBy: { name: 'asc' },
    });
    return CategoryMapper.toResponseList(categories);
  }
}
