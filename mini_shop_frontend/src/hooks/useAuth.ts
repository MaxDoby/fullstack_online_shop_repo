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

interface AuthResponse { user: AuthUser; accessToken: string}

const apiBaseUrl = '/api';

const useAuth = () => {
	const [authUser, setAuthUser] = useState<AuthUser | null>(null);
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [isAuthLoaded, setIsAuthLoaded] = useState<boolean>(false);

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

		const data: AuthResponse = await response.json();

		if (!response.ok) throw new Error('Inregistrarea a esuat.');

		setAuthUser(data.user);
		setAccessToken(data.accessToken);
		saveAuthSession(JSON.stringify(data.user), data.accessToken);
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

		const data: AuthResponse = await response.json();

		if (!response.ok) {
			throw new Error('Autentificare esuata.');
		}

		setAuthUser(data.user);
		setAccessToken(data.accessToken);

		saveAuthSession(
			JSON.stringify(data.user),
			data.accessToken,
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
