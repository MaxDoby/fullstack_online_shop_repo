import { useState, useEffect } from 'react';

interface ProductPageMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean
}

interface ProductImage {
    id: number;
    isPrimary: boolean;
    createdAt?: string;
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
    productImages: ProductImage[];
}

export interface Product extends ProductFromApi {
    imageUrl: string;
}

interface ProductsResponse {
    items: ProductFromApi[];
	meta: ProductPageMeta;
}

const productsOnPage = 16;
const searchDebounceMs = 500;

const apiBaseUrl = '/api';

const getProductImageUrl = (product: ProductFromApi) => {
	const firstImage = product.productImages[0];

	if (!firstImage) return product.thumbnail || '/placeholder-product.png';

	return `${apiBaseUrl}/images/${firstImage.id}/300/300`;
};

const useProducts = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [categories, setCategories] = useState<string[]>([]);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [selectedImageGallery, setSelectedImageGallery] = useState<string[]>([]);
	const [activeCategory, setActiveCategory] = useState<string>('All products');
	const [totalPages, setTotalPages] = useState<number>(1);
	const [productsReloadKey, setProductsReloadKey] = useState<number>(0);

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
				setCategories(['All products', ...categoriesData]);
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

			if (activeCategory !== 'All products') params.set('category', activeCategory);
			const response = await fetch(`${apiBaseUrl}/product?${params.toString()}`);
			const data: ProductsResponse = await response.json();

			const productsWithImageUrl = data.items.map((product) => ({
				...product,
				imageUrl: getProductImageUrl(product),
			}));

			setProducts(productsWithImageUrl);
			setTotalPages(data.meta.totalPages);
		};
		loadProducts();
	}, [currentPage, activeCategory, debouncedSearchQuery, productsReloadKey]);

	const reloadProducts = () => {
		setProductsReloadKey((currentKey) => currentKey + 1);
	};

	const resetProductsView = () => {
		setSearchQuery('');
		setDebouncedSearchQuery('');
		setActiveCategory('All products');
		setCurrentPage(1);
		setProductsReloadKey((currentKey) => currentKey + 1);
	};

	const deleteProduct = async (productId: number, accessToken: string) => {
		const response = await fetch(`${apiBaseUrl}/product/${productId}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) throw new Error('Product delete failed.');

		setProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId));
	};

	const openProductImageGallery = async (product: Product) => {
		const response = await fetch(`${apiBaseUrl}/images/product/${product.id}`);
		const productImages: ProductImage[] = await response.json();

		const imageUrls = productImages.map((image) => `${apiBaseUrl}/images/${image.id}/900/650`);

		if (imageUrls.length === 0) {
			setSelectedImage(product.imageUrl);
			setSelectedImageGallery([product.imageUrl]);
			return;
		}

		setSelectedImage(imageUrls[0]);
		setSelectedImageGallery(imageUrls);
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
		reloadProducts,
		deleteProduct,
		selectedImageGallery,
		setSelectedImageGallery,
		openProductImageGallery,
		resetProductsView,
	};
};

export default useProducts;
