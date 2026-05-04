import React from 'react';
import type { Product } from '../hooks/useProducts.ts';
import type { CartItem } from '../hooks/useCart.ts';

type SetCartItems = React.Dispatch<React.SetStateAction<CartItem[]>>;

export const logicAddToCart = (product: Product, setCartItems: SetCartItems) => {
	setCartItems((prevItems) => {
		const existingItem = prevItems.find((item) => item.id === product.id);

		if (existingItem) {
			return prevItems.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
		}

		return [...prevItems, { ...product, quantity: 1 }];
	});
};

export const logicRemoveFromCart = (
	productId: number,
	setCartItems: SetCartItems,
) => {
	setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
};

export const logicClearCart = (setCartItems: SetCartItems) => {
	setCartItems([]);
};

export const logicIncreaseCartItemQuantity = (
	productId: number,
	setCartItems: SetCartItems,
) => {
	setCartItems((prevItems) => prevItems.map((item) => (
		item.id === productId ? { ...item, quantity: item.quantity + 1 } : item)));
};

export const logicDecreaseCartItemQuantity = (productId: number, setCartItems: SetCartItems) => {
	setCartItems((prevItems) => prevItems.flatMap((item) => {
		if (item.id !== productId) {
			return [item];
		}

		if (item.quantity === 1) {
			return [];
		}

		return [{ ...item, quantity: item.quantity - 1 }];
	}));
};
