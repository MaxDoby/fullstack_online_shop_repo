import { type ChangeEvent, useState } from 'react';

export interface AdminProductFormData {
    title: string;
    description: string;
    price: string;
    stock: string;
    category: string;
    imageFile: File | null;
}

export interface CreateAdminProductPayload {
    title: string;
    description: string;
    price: number;
    stock: number;
    category: string;
	thumbnail: string;
}

const initialAdminProductFormData: AdminProductFormData = {
	title: '',
	description: '',
	price: '',
	stock: '',
	category: '',
	imageFile: null,
};

const useAdminProductForm = () => {
	const [formData, setFormData] = useState<AdminProductFormData>(initialAdminProductFormData);

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;

		setFormData((currentFormData) => ({
			...currentFormData,
			[name]: value,
		}));
	};

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0] ?? null;

		setFormData((currentFormData) => ({
			...currentFormData,
			imageFile: file,
		}));
	};

	const resetForm = () => {
		setFormData(initialAdminProductFormData);
	};

	const getCreateProductPayload = (): CreateAdminProductPayload => ({
		title: formData.title,
		description: formData.description,
		price: Number(formData.price),
		stock: Number(formData.stock),
		category: formData.category,
		thumbnail: '/images/products/placeholder.webp',
	});

	return {
		formData,
		handleInputChange,
		resetForm,
		getCreateProductPayload,
		handleFileChange,
	};
};

export default useAdminProductForm;
