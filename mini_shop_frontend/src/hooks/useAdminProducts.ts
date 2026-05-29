import { useEffect, useState } from 'react';
import type { CreateAdminProductPayload } from './useAdminProductForm';

export interface AdminProduct {
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

export interface AdminProductImages {
	id: number;
	productId: number;
	storageKey: string;
	originalName: string;
	mimeType: string;
	size: number;
	width: number;
	height: number;
	isPrimary: boolean;
	createdAt: string;
}

interface AdminProductsResponse {
    items: AdminProduct[];
}

const apiBaseUrl = '/api';

const useAdminProducts = () => {
	const [adminProducts, setAdminProducts] = useState<AdminProduct[]>([]);
	const [adminProductsError, setAdminProductsError] = useState<string | null>(null);
	const [selectedProductIdForImages, setSelectedProductIdForImages] = useState<number | null>(null);
	const [selectedProductImages, setSelectedProductImages] = useState<AdminProductImages[]>([]);

	useEffect(() => {
		const loadAdminProducts = async () => {
			try {
				const response = await fetch(`${apiBaseUrl}/products?page=1&limit=100`);

				if (!response.ok) {
					throw new Error('Unable to load admin products.');
				}

				const data: AdminProductsResponse = await response.json();

				setAdminProducts(data.items);
			} catch (error) {
				setAdminProductsError(error instanceof Error ? error.message : 'Unknown error.');
			}
		};

		loadAdminProducts();
	}, []);

	const createAdminProduct = async (payload: CreateAdminProductPayload, accessToken: string) => {
		const response = await fetch(`${apiBaseUrl}/products`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			throw new Error('Product create failed.');
		}

		const createdProduct: AdminProduct = await response.json();

		setAdminProducts((currentProducts) => [createdProduct, ...currentProducts]);

		return createdProduct;
	};

	const uploadAdminProductImage = async (productId: number, imageFile: File, accessToken: string) => {
		const formData = new FormData();
		formData.append('file', imageFile);

		const response = await fetch(`${apiBaseUrl}/images/products/${productId}`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
			body: formData,
		});

		if (!response.ok) {
			throw new Error('Product image upload failed.');
		}
	};

	const deleteAdminProduct = async (productId: number, accessToken: string) => {
		const response = await fetch(`${apiBaseUrl}/products/${productId}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) {
			throw new Error('Product delete failed.');
		}

		setAdminProducts((currentProducts) => currentProducts.filter((product) => product.id !== productId));
	};

	const updateAdminProduct = async (productId: number, payload: CreateAdminProductPayload, accessToken: string) => {
		const response = await fetch(`${apiBaseUrl}/products/${productId}`, {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) throw new Error('Product update failed.');

		const updatedProduct: AdminProduct = await response.json();

		setAdminProducts((currentProducts) => currentProducts.map((product) => {
			if (product.id === productId) return updatedProduct;

			return product;
		}));

		return updatedProduct;
	};

	const loadProductImages = async (productId: number) => {
		setSelectedProductIdForImages(productId);

		const response = await fetch(`${apiBaseUrl}/images/products/${productId}`);

		if (!response.ok) throw new Error('Product images load failed.');

		const images: AdminProductImages[] = await response.json();

		setSelectedProductImages(images);
	};

	const setPrimaryProductImage = async (imageId: number, accessToken: string) => {
		const response = await fetch(`${apiBaseUrl}/images/${imageId}/primary`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) throw new Error('Set primary image failed.');

		setSelectedProductImages((currentImages) => currentImages.map((image) => ({
			...image,
			isPrimary: image.id === imageId,
		})));
	};

	const deleteAdminProductImage = async (imageId: number, accessToken: string) => {
		const response = await fetch(`${apiBaseUrl}/images/${imageId}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) throw new Error('Image delete failed.');

		setSelectedProductImages((currentImages) => currentImages.filter((image) => image.id !== imageId));
	};

	return {
		adminProducts,
		adminProductsError,
		createAdminProduct,
		deleteAdminProduct,
		uploadAdminProductImage,
		updateAdminProduct,
		selectedProductIdForImages,
		selectedProductImages,
		loadProductImages,
		deleteAdminProductImage,
		setPrimaryProductImage,
	};
};

export default useAdminProducts;
