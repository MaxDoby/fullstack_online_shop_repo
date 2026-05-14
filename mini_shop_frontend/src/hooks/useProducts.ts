import { useState, useEffect } from 'react';

export interface Product {
	id: number;
	title: string;
	description: string;
	price: number;
	stock: number;
	category: {
		id: number;
		name: string;
	};
	thumbnail: string;
}

interface ProductsResponse {
    items: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

const productsOnPage = 8;
const searchDebounceMs = 500;

const apiBaseUrl = '/api';

const useProducts = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [categories, setCategories] = useState<string[]>([]);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [activeCategory, setActiveCategory] = useState<string>('Toate');
	const [totalPages, setTotalPages] = useState<number>(1);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setDebouncedSearchQuery(searchQuery.trim());
		}, searchDebounceMs);

		return () => clearTimeout(timeoutId);
	}, [searchQuery]);

	useEffect(() => {
		const loadCategories = async () => {
			try {
				const uniqueCategories = await fetch(`${apiBaseUrl}/categories`);
				const categoriesData: string[] = await uniqueCategories.json();
				setCategories(['Toate', ...categoriesData]);
			} catch (error) {
				console.error('Fetch Error:', error);
			}
		};

		loadCategories();
	}, []);

	useEffect(() => {
		const loadProducts = async () => {
			const params = new URLSearchParams();
			params.set('page', String(currentPage));
			params.set('limit', String(productsOnPage));

			if (debouncedSearchQuery) {
				params.set('search', debouncedSearchQuery);
			}

			if (activeCategory !== 'Toate') params.set('category', activeCategory);
			const response = await fetch(`${apiBaseUrl}/products?${params.toString()}`);
			const data: ProductsResponse = await response.json();

			setProducts(data.items);
			setTotalPages(data.totalPages);
		};
		loadProducts();
	}, [currentPage, activeCategory, debouncedSearchQuery]);

	return {
		products,
		categories,
		searchQuery,
		setSearchQuery,
		currentPage,
		setCurrentPage,
		selectedImage,
		setSelectedImage,
		activeCategory,
		setActiveCategory,
		totalPages,
	};
};

export default useProducts;
