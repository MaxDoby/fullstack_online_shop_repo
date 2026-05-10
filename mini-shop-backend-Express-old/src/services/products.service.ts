import prisma from '../lib/prisma';


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

export const createProduct = async (data: CreateProductData) => {
	return prisma.product.create({
		data,
	 });
};

export const getAllProducts = async () => {
	return await prisma.product.findMany({
			orderBy: {
				id: 'asc'
			}
		});
};

export const getAllCategories = async () => {
	const products = await getAllProducts();

	const uniqueCategories = [...new Set(products.map((product) => product.category))]

	return uniqueCategories;
}

export const getProductById = async (id: number) => {
		return await prisma.product.findUnique({
			where: { id },
		});
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
