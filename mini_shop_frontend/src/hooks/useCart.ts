import { useState, useEffect } from 'react';
import {
	logicAddToCart,
	logicRemoveFromCart,
	logicClearCart,
	logicIncreaseCartItemQuantity,
	logicDecreaseCartItemQuantity,
} from '../utils/cartActions.ts';
import type { Product } from './useProducts.ts';
import { getUserCartStorageKey, getUserOrdersStorageKey } from '../utils/authHelpers.ts';

export interface CartItem extends Product {
	quantity: number;
}

export interface OrderHistoryItem {
	id: string;
	userId: number | null;
	items: CartItem[];
	total: number;
	createdAt: string;
}

const useCart = (userId: number | null) => {
	const [cartItems, setCartItems] = useState<CartItem[]>([]);
	const [isCartLoaded, setIsCartLoaded] = useState<boolean>(false);
	const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);

	const cartStorageKey = userId ? getUserCartStorageKey(userId) : 'mini-shop-cart';
	const ordersStorageKey = userId ? getUserOrdersStorageKey(userId) : null;

	const addToCart = (product: Product) => {
		logicAddToCart(product, setCartItems);
	};
	const removeFromCart = (productId: number) => {
		logicRemoveFromCart(productId, setCartItems);
	};
	const clearCart = () => {
		logicClearCart(setCartItems);
	};
	const increaseCartItemQuantity = (productId: number) => {
		logicIncreaseCartItemQuantity(productId, setCartItems);
	};
	const decreaseCartItemQuantity = (productId: number) => {
		logicDecreaseCartItemQuantity(productId, setCartItems);
	};
	const saveOrderToHistory = () => {
		if (cartItems.length === 0 || !ordersStorageKey) return;

		const savedOrders = localStorage.getItem(ordersStorageKey);

		const parsedOrders: OrderHistoryItem[] = savedOrders ? JSON.parse(savedOrders) : [];

		const newOrder: OrderHistoryItem = {
			id: crypto.randomUUID(),
			userId,
			items: cartItems.map((item) => ({ ...item })),
			total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
			createdAt: new Date().toISOString(),
		};

		const updatedOrders = [...parsedOrders, newOrder];

		localStorage.setItem(ordersStorageKey, JSON.stringify(updatedOrders));
		setOrderHistory(updatedOrders);
	};

	const checkout = () => {
		saveOrderToHistory();
		alert('Comanda a fost plasata cu succes!');
		setCartItems([]);
	};

	useEffect(() => {
		setIsCartLoaded(false);

		const savedCart = localStorage.getItem(cartStorageKey);

		if (savedCart) {
			setCartItems(JSON.parse(savedCart));
		} else {
			setCartItems([]);
		}

		setIsCartLoaded(true);
	}, [cartStorageKey]);

	useEffect(() => {
		if (!ordersStorageKey) {
			setOrderHistory([]);
			return;
		}

		const savedOrders = localStorage.getItem(ordersStorageKey);

		if (savedOrders) {
			setOrderHistory(JSON.parse(savedOrders));
		} else {
			setOrderHistory([]);
		}
	}, [ordersStorageKey]);

	useEffect(() => {
		if (!isCartLoaded) return;
		localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
	}, [cartItems, isCartLoaded, cartStorageKey]);

	const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
	const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

	return {
		cartItems,
		cartCount,
		addToCart,
		cartTotal,
		removeFromCart,
		clearCart,
		checkout,
		increaseCartItemQuantity,
		decreaseCartItemQuantity,
		orderHistory,
	};
};

export default useCart;
