export const AUTH_USER_STORAGE_KEY = 'mini-shop-auth-user';
export const AUTH_ACCESS_TOKEN_STORAGE_KEY = 'mini-shop-auth-access-token';
export const AUTH_REFRESH_TOKEN_STORAGE_KEY = 'mini-shop-auth-refresh-token';
export const LOCAL_AUTH_USERS_STORAGE_KEY = 'mini-shop-local-auth-users';

export const saveAuthSession = (
	user: string,
	accessToken: string,
	refreshToken: string,
) => {
	localStorage.setItem(AUTH_USER_STORAGE_KEY, user);
	localStorage.setItem(AUTH_ACCESS_TOKEN_STORAGE_KEY, accessToken);
	localStorage.setItem(AUTH_REFRESH_TOKEN_STORAGE_KEY, refreshToken);
};

export const loadAuthSession = () => {
	const user = localStorage.getItem(AUTH_USER_STORAGE_KEY);
	const accessToken = localStorage.getItem(AUTH_ACCESS_TOKEN_STORAGE_KEY);
	const refreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);

	return {
		user,
		accessToken,
		refreshToken,
	};
};

export const clearAuthSession = () => {
	localStorage.removeItem(AUTH_USER_STORAGE_KEY);
	localStorage.removeItem(AUTH_ACCESS_TOKEN_STORAGE_KEY);
	localStorage.removeItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);
};

export const getUserCartStorageKey = (userId: number) => `mini-shop-cart-user-${userId}`;

export const getUserOrdersStorageKey = (userId: number) => `mini-shop-orders-user-${userId}`;

export const loadLocalAuthUsers = () => {
	const savedUsers = localStorage.getItem(LOCAL_AUTH_USERS_STORAGE_KEY);
	return savedUsers ? JSON.parse(savedUsers) : [];
};

export const saveLocalAuthUsers = (users: unknown[]) => {
	localStorage.setItem(LOCAL_AUTH_USERS_STORAGE_KEY, JSON.stringify(users));
};
