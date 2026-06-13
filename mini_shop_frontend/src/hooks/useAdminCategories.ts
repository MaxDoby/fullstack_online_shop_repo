import { useEffect, useState } from 'react';

export interface AdminCategory {
    id: number;
    name: string;
}

const apiBaseUrl = '/api';

const useAdminCategories = () => {
	const [categories, setCategories] = useState<AdminCategory[]>([]);
	const [categoriesError, setCategoriesError] = useState<string | null>(null);

	const loadCategories = async () => {
		try {
			const response = await fetch(`${apiBaseUrl}/categories`);

			if (!response.ok) {
				throw new Error('Categories load failed.');
			}

			const categoriesData: AdminCategory[] = await response.json();
			setCategories(categoriesData);
		} catch (error) {
			setCategoriesError(error instanceof Error ? error.message : 'Unknown categories error.');
		}
	};

	useEffect(() => {
		loadCategories().catch((error: unknown) => {
			setCategoriesError(error instanceof Error ? error.message : 'Categories load failed.');
		});
	}, []);

	return {
		categories,
		categoriesError,
		loadCategories,
	};
};

export default useAdminCategories;
