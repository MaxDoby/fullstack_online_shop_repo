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

interface AdminProductsResponse {
    items: AdminProduct[];
}

const apiBaseUrl = '/api';

const useAdminProducts = () => {
	const [adminProducts, setAdminProducts] = useState<AdminProduct[]>([]);
	const [adminProductsError, setAdminProductsError] = useState<string | null>(null);

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

	return {
		adminProducts,
		adminProductsError,
		createAdminProduct,
		deleteAdminProduct,
		uploadAdminProductImage,
	};
};

export default useAdminProducts;
