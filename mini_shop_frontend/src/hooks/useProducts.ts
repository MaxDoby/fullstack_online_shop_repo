import { useState, useEffect } from 'react';

export interface Product {
	id: number;
	title: string;
	description: string;
	price: number;
	stock: number;
	category: string;
	thumbnail: string;
}

const productsOnPage = 8;
const searchDebounceMs = 500;
const productionApiUrl = 'https://mini-shop-backend.onrender.com';

const apiBaseUrl = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || productionApiUrl);

const useProducts = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [allProducts, setAllProducts] = useState<Product[]>([]);
	const [categories, setCategories] = useState<string[]>([]);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [activeCategory, setActiveCategory] = useState<string>('Toate');
	const [totalProducts, setTotalProducts] = useState<number>(0);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setDebouncedSearchQuery(searchQuery.trim());
		}, searchDebounceMs);

		return () => clearTimeout(timeoutId);
	}, [searchQuery]);

	useEffect(() => {
		const loadProducts = async () => {
			try {
				const response = await fetch(`${apiBaseUrl}/products`);
				const data: Product[] = await response.json();

				setAllProducts(data);

				const uniqueCategories = [...new Set(data.map((product) => product.category))];
				setCategories(['Toate', ...uniqueCategories]);
			} catch (error) {
				console.error('Fetch Error:', error);
			}
		};

		loadProducts();
	}, []);

	useEffect(() => {
		const trimmedSearch = debouncedSearchQuery.trim().toLowerCase();

		const filteredProducts = allProducts.filter((product) => {
			const matchesCategory = activeCategory === 'Toate' || product.category === activeCategory;
			const matchesSearch = !trimmedSearch
				|| product.title.toLowerCase().includes(trimmedSearch)
				|| product.description.toLowerCase().includes(trimmedSearch);

			return matchesCategory && matchesSearch;
		});
		setTotalProducts(filteredProducts.length);

		const skip = (currentPage - 1) * productsOnPage;
		const paginatedProducts = filteredProducts.slice(skip, skip + productsOnPage);

		setProducts(paginatedProducts);
	}, [allProducts, currentPage, activeCategory, debouncedSearchQuery]);

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
		totalProducts,
		productsOnPage,
	};
};

export default useProducts;
