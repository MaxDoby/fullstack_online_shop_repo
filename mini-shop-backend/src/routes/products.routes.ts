import { Router } from 'express';
import {
	createProductController,
	getAllProductsController,
	getProductByIdController,
	updateProductController,
	deleteProductController,
	getAllCategoriesController 
} from '../controllers/products.controller';

const router = Router();

router.post('/', createProductController);
router.get('/', getAllProductsController);
router.get('/categories', getAllCategoriesController);
router.get('/:id', getProductByIdController);
router.put('/:id', updateProductController);
router.delete('/:id', deleteProductController);

export default router;