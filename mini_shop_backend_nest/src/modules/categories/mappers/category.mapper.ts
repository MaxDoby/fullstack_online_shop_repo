import type { CategoryResponseDto } from '../dto/category-response.dto';

type CategoryEntity = {
  id: number;
  name: string;
};

export class CategoryMapper {
  public static toResponse(category: CategoryEntity): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
    };
  }

  public static toResponseList(
    categories: CategoryEntity[],
  ): CategoryResponseDto[] {
    return categories.map((category) => this.toResponse(category));
  }
}
