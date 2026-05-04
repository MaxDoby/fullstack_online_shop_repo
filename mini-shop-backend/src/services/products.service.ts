import prisma from '../lib/prisma';
import fs from 'node:fs/promises';
import path from 'node:path';

interface CreateProductData {
	title : string;
	description : string;
	price : number;
	stock : number;
	category: string;
	thumbnail: string;
}

interface UpdateProductData {
    title?: string;
    description?: string;
    price?: number;
    stock?: number;
    category?: string;
    thumbnail?: string;
}

interface ProductData {
	id: number;
	title: string;
	description: string;
	price: number;
	stock: number;
	category: string;
	thumbnail: string;
}

const seedProductsPath = path.resolve(__dirname, '../../scripts/products-seed-data.json');

const getSeedProducts = async (): Promise<ProductData[]> => {
	const rawProducts = await fs.readFile(seedProductsPath, 'utf8');

	return JSON.parse(rawProducts) as ProductData[];
};

export const createProduct = async (data: CreateProductData) => {
	return prisma.product.create({
		data,
	 });
};

export const getAllProducts = async () => {
	try {
		return await prisma.product.findMany({
			orderBy: {
				id: 'asc'
			}
		});
	} catch (error) {
		console.error('Database unavailable. Serving seed products instead.', error);
		return getSeedProducts();
	}
};

export const getAllCategories = async () => {
	const products = await getAllProducts();

	const uniqueCategories = [...new Set(products.map((product) => product.category))]

	return uniqueCategories;
}

export const getProductById = async (id: number) => {
	try {
		return await prisma.product.findUnique({
			where: { id },
		});
	} catch (error) {
		console.error('Database unavailable. Serving seed product instead.', error);
		const products = await getSeedProducts();

		return products.find((product) => product.id === id) ?? null;
	}
}

export const updateProduct = async (id: number, data: UpdateProductData) => {
	return prisma.product.update({
		where: { id },
		data,
	});
}

export const deleteProduct = async (id: number) => {
	return prisma.product.delete({
		where: { id },
	});
};
