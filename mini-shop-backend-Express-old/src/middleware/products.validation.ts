import { Request, Response, NextFunction } from 'express';

export const validateCreateProduct = (req: Request, res: Response, next: NextFunction) => {
	const { title, description, price, stock, category, thumbnail } = req.body;
	const errors: string[] = [];

	if (typeof title !== 'string' || title.trim() === '') {
		errors.push('Title is required.');
	}
    if (typeof description !== 'string' || description.trim() === '') {
		errors.push('Description is required.');
	}
	if (typeof price !== 'number' || price <= 0) {
		errors.push('Invalid price format.')
	}
    if (typeof stock !== 'number' || !Number.isInteger(stock) || stock < 0) {
		errors.push('Invalid stock format')
	}
	if (typeof category !== 'string' || category.trim() === '') {
		errors.push('Category is required.');
	}
	if (typeof thumbnail !== 'string' || thumbnail.trim() === '') {
		errors.push('Thumbnail is required.');
	}
	if (errors.length > 0) {
			res.status(400).json({
			message: 'Validation failed',
			errors,
		})
	return;
	};

	next()
};

export const validateUpdateProduct = (req: Request, res: Response, next: NextFunction) => {
    const { title, description, price, stock, category, thumbnail } = req.body;
    const errors: string[] = [];

	if (Object.keys(req.body).length === 0) {
		res.status(400).json(
		{message: 'At least one field must be completed.'}); 
		return
	}

    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
        errors.push('Title must be a valid string.');
    }
    if (description !== undefined && (
		typeof description !== 'string' || description.trim()=== '')) {
        errors.push('Description must be a valid string.');
    }
    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
        errors.push('Invalid price format.');
    }
    if (stock !== undefined && (
		typeof stock !== 'number' || !Number.isInteger(stock) || stock < 0)) {
        errors.push('Invalid stock format.');
    }
    if (category !== undefined && (typeof category !== 'string' || category.trim() === '')) {
        errors.push('Category must be a valid string.');
    }
    if (thumbnail !== undefined && (
		typeof thumbnail !== 'string' || thumbnail.trim() === '')) {
        errors.push('Invalid thumbnail format.');
    }
    if (errors.length > 0) {
        res.status(400).json({
            message: 'Validation failed',
            errors,
        });
        return;
    }
	next();
}
