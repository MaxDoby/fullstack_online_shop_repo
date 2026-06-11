import { useState, useEffect } from 'react';
import {
	logicAddToCart,
	logicRemoveFromCart,
	logicClearCart,
	logicIncreaseCartItemQuantity,
	logicDecreaseCartItemQuantity,
} from '../utils/cartActions.ts';
import type { Product } from './useProducts.ts';
import { getUserCartStorageKey } from '../utils/authHelpers.ts';

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

interface BackendOrderItem {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    priceAtPurchase: number;
    product: Product;
}

interface BackendOrder {
    id: number;
    userId: number;
    totalCost: number;
    createdAt: string;
    orderItems: BackendOrderItem[];
}

const apiBaseUrl = '/api';

const mapBackendOrderToHistory = (order: BackendOrder): OrderHistoryItem => ({
	id: String(order.id),
	userId: order.userId,
	total: order.totalCost,
	createdAt: order.createdAt,
	items: order.orderItems.map((orderItem) => ({
		...orderItem.product,
		price: orderItem.priceAtPurchase,
		quantity: orderItem.quantity,
	})),
});

const useCart = (userId: number | null, accessToken: string | null) => {
	const [cartItems, setCartItems] = useState<CartItem[]>([]);
	const [isCartLoaded, setIsCartLoaded] = useState<boolean>(false);
	const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);

	const cartStorageKey = userId ? getUserCartStorageKey(userId) : 'mini-shop-cart';

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

	const checkout = async () => {
		if (!accessToken) throw new Error('Autentificarea necesara pentru plasarea comenzii.');

		const orderItemsForBackend = cartItems.map((item) => ({
			productId: item.id,
			quantity: item.quantity,
		}));

		const response = await fetch(`${apiBaseUrl}/orders`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken}`,
			},
			body: JSON.stringify({ items: orderItemsForBackend }),
		});

		if (!response.ok) throw new Error('Unable to create order.');

		const createdOrder: BackendOrder = await response.json();
		const mappedOrder = mapBackendOrderToHistory(createdOrder);

		setOrderHistory((currentOrders) => [...currentOrders, mappedOrder]);
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
		if (!userId || !accessToken) {
			setOrderHistory([]);
			return;
		}

		const loadOrders = async () => {
			const response = await fetch(`${apiBaseUrl}/orders/my`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (!response.ok) {
				setOrderHistory([]);
				return;
			}

			const data: BackendOrder[] = await response.json();
			const mappedOrders = data.map(mapBackendOrderToHistory).reverse();

			setOrderHistory(mappedOrders);
		};

		loadOrders();
	}, [userId, accessToken]);

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
