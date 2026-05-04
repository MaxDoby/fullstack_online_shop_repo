import { Request, Response } from 'express';
import { 
	createProduct,
	getAllProducts,
	getProductById,
	updateProduct,
	deleteProduct,
	getAllCategories
}	 from '../services/products.service';

export const createProductController = async (req: Request, res: Response) => {
	try {
		const { title, description, price, stock, category, thumbnail } = req.body;

		const newProduct = await createProduct({
			title,
			description,
			price,
			stock,
			category,
			thumbnail,
		});

		res.status(201).json(newProduct);
	} catch (error) {
		res.status(500).json({
			message: 'Failed to create product'
		});
	}
};

export const getAllProductsController = async (_req: Request, res: Response) => {
    try {
        const products = await getAllProducts();

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch products',
            error,
        });
    }
};

export const getAllCategoriesController = async (_req: Request, res: Response) => {
	try {
		const categories = await getAllCategories();

		res.status(200).json(categories);
	} catch (error) {
		res.status(500).json({
			message: 'Failed to fetch categories',
			error,
		});
	}
}

export const getProductByIdController = async (req: Request, res: Response) => {
    try {
        const productId = Number(req.params.id);
        const product = await getProductById(productId);

        if (!product) {
            res.status(404).json({
                message: 'Product not found',
            });
            return;
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch product',
            error,
        });
    }
};

export const updateProductController = async (req: Request, res: Response) => {
	try {
		const productId = Number(req.params.id);
		const { title, description, price, stock, category, thumbnail } = req.body;

		const updatedProduct = await updateProduct(productId, {
			title, description, price, stock, category, thumbnail
		});
		res.status(200).json(updatedProduct);
	} catch (error) {
		res.status(500).json({
			message: 'Failed to update product',
			error,
		});
	}
}

export const deleteProductController = async (req: Request, res: Response) => {
	try {
		const productId = Number(req.params.id);

		await deleteProduct(productId);
		res.status(200).json({
			message: 'Product deleted successfully'
		})
	} catch (error) {
		res.status(500).json({
			message: 'Failed to delete product',
			error,
		});
	}

}