export const AUTH_USER_STORAGE_KEY = 'mini-shop-auth-user';
export const AUTH_ACCESS_TOKEN_STORAGE_KEY = 'mini-shop-auth-access-token';

export const saveAuthSession = (
	user: string,
	accessToken: string,
) => {
	localStorage.setItem(AUTH_USER_STORAGE_KEY, user);
	localStorage.setItem(AUTH_ACCESS_TOKEN_STORAGE_KEY, accessToken);
};

export const loadAuthSession = () => {
	const user = localStorage.getItem(AUTH_USER_STORAGE_KEY);
	const accessToken = localStorage.getItem(AUTH_ACCESS_TOKEN_STORAGE_KEY);

	return {
		user,
		accessToken,
	};
};

export const clearAuthSession = () => {
	localStorage.removeItem(AUTH_USER_STORAGE_KEY);
	localStorage.removeItem(AUTH_ACCESS_TOKEN_STORAGE_KEY);
};

export const getUserCartStorageKey = (userId: number) => `mini-shop-cart-user-${userId}`;

export const getUserOrdersStorageKey = (userId: number) => `mini-shop-orders-user-${userId}`;
