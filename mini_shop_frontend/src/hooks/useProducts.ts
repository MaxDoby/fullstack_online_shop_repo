import { useState, useEffect } from 'react';

interface ProductPageMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean
}

interface ProductFromApi {
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
    productImages: {
        id: number;
    }[];
}

export interface Product extends ProductFromApi {
    imageUrl: string;
}

interface ProductsResponse {
    items: ProductFromApi[];
	meta: ProductPageMeta;
}

const productsOnPage = 8;
const searchDebounceMs = 500;

const apiBaseUrl = '/api';

const getProductImageUrl = (product: ProductFromApi) => {
	const firstImage = product.productImages[0];

	if (!firstImage) return product.thumbnail;

	return `${apiBaseUrl}/images/${firstImage.id}/300/200`;
};

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

			const productsWithImageUrl = data.items.map((product) => ({
				...product,
				imageUrl: getProductImageUrl(product),
			}));

			setProducts(productsWithImageUrl);
			setTotalPages(data.meta.totalPages);
		};
		loadProducts();
	}, [currentPage, activeCategory, debouncedSearchQuery]);

	const deleteProduct = async (productId: number, accessToken: string) => {
		const response = await fetch(`${apiBaseUrl}/products/${productId}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) throw new Error('Product delete failed.');

		setProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId));
	};

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
		deleteProduct,
	};
};

export default useProducts;
