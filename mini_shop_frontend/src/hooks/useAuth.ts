import { useState, useEffect } from 'react';
import {
	clearAuthSession,
	loadAuthSession,
	saveAuthSession,
} from '../utils/authHelpers';

export interface AuthUser {
	id: number;
	username: string;
	email: string;
	firstName: string;
	lastName: string;
}

interface AuthResponse {
	user: AuthUser;
	accessToken: string;
}

interface ApiErrorResponse {
    message: string | string[];
    error?: string;
    statusCode?: number;
}

const useAuth = () => {
	const apiBaseUrl = '/api';
	const [authUser, setAuthUser] = useState<AuthUser | null>(null);
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [isAuthLoaded, setIsAuthLoaded] = useState<boolean>(false);

	const getApiErrorMessage = (data: ApiErrorResponse, fallbackMessage: string) => {
		if (Array.isArray(data.message)) {
			return data.message.join(' ');
		}

		if (data.message) {
			return data.message;
		}

		return fallbackMessage;
	};

	useEffect(() => {
		const session = loadAuthSession();

		if (session.user) {
			setAuthUser(JSON.parse(session.user));
		}

		if (session.accessToken) {
			setAccessToken(session.accessToken);
		}

		setIsAuthLoaded(true);
	}, []);

	const logout = () => {
		clearAuthSession();
		setAuthUser(null);
		setAccessToken(null);
	};

	const registerLocal = async (
		username: string,
		password: string,
		email: string,
		firstName: string,
		lastName: string,
	) => {
		const response = await fetch(`${apiBaseUrl}/auth/register`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username,
				password,
				email,
				firstName,
				lastName,
			}),
		});

		const data: AuthResponse | ApiErrorResponse = await response.json();

		if (!response.ok) {
			throw new Error(getApiErrorMessage(data as ApiErrorResponse, 'Inregistrarea a esuat.'));
		}

		const authData = data as AuthResponse;

		setAuthUser(authData.user);
		setAccessToken(authData.accessToken);
		saveAuthSession(JSON.stringify(authData.user), authData.accessToken);
	};

	const login = async (username: string, password: string) => {
		const response = await fetch(`${apiBaseUrl}/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				identifier: username,
				password,
			}),
		});

		const data: AuthResponse | ApiErrorResponse = await response.json();

		if (!response.ok) {
			throw new Error(getApiErrorMessage(data as ApiErrorResponse, 'Autentificarea a esuat.'));
		}

		const authData = data as AuthResponse;

		setAuthUser(authData.user);
		setAccessToken(authData.accessToken);

		saveAuthSession(
			JSON.stringify(authData.user),
			authData.accessToken,
		);
	};

	const isAuthenticated = Boolean(authUser && accessToken);

	return {
		authUser,
		accessToken,
		isAuthenticated,
		isAuthLoaded,
		login,
		logout,
		registerLocal,
	};
};

export default useAuth;
