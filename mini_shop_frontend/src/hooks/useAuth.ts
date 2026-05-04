import { useState, useEffect } from 'react';
import {
	clearAuthSession,
	loadAuthSession,
	saveAuthSession,
	loadLocalAuthUsers,
	saveLocalAuthUsers,
} from '../utils/authHelpers';

export interface AuthUser {
	id: number;
	username: string;
	email: string;
	firstName: string;
	lastName: string;
}

interface LocalAuthUser extends AuthUser {
	password: string;
}

const useAuth = () => {
	const [authUser, setAuthUser] = useState<AuthUser | null>(null);
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [refreshToken, setRefreshToken] = useState<string | null>(null);
	const [isAuthLoaded, setIsAuthLoaded] = useState<boolean>(false);

	useEffect(() => {
		const session = loadAuthSession();

		if (session.user) {
			setAuthUser(JSON.parse(session.user));
		}

		if (session.accessToken) {
			setAccessToken(session.accessToken);
		}

		if (session.refreshToken) {
			setRefreshToken(session.refreshToken);
		}

		setIsAuthLoaded(true);
	}, []);

	const logout = () => {
		clearAuthSession();
		setAuthUser(null);
		setAccessToken(null);
		setRefreshToken(null);
	};

	const registerLocal = async (
		username: string,
		password: string,
		email: string,
		firstName: string,
		lastName: string,
	) => {
		const localUsers: LocalAuthUser[] = loadLocalAuthUsers();

		const usernameExists = localUsers.some((user) => user.username === username);
		if (usernameExists) {
			throw new Error('Username-ul exista deja.');
		}

		const emailExists = localUsers.some((user) => user.email === email);
		if (emailExists) {
			throw new Error('Email-ul exista deja.');
		}

		const newUser: LocalAuthUser = {
			id: Date.now(),
			username,
			password,
			email,
			firstName,
			lastName,
		};

		saveLocalAuthUsers([...localUsers, newUser]);

		const authUserData: AuthUser = {
			id: newUser.id,
			username: newUser.username,
			email: newUser.email,
			firstName: newUser.firstName,
			lastName: newUser.lastName,
		};

		const localAccessToken = `local-access-token-${newUser.id}`;
		const localRefreshToken = `local-refresh-token-${newUser.id}`;

		setAuthUser(authUserData);
		setAccessToken(localAccessToken);
		setRefreshToken(localRefreshToken);

		saveAuthSession(JSON.stringify(authUserData), localAccessToken, localRefreshToken);
	};

	const login = async (username: string, password: string) => {
		const localUsers: LocalAuthUser[] = loadLocalAuthUsers();

		const localUser = localUsers.find((user) => user.username === username && user.password === password);

		if (localUser) {
			const authUserData: AuthUser = {
				id: localUser.id,
				username: localUser.username,
				email: localUser.email,
				firstName: localUser.firstName,
				lastName: localUser.lastName,
			};

			const localAccessToken = `local-access-token-${localUser.id}`;
			const localRefreshToken = `local-refresh-token-${localUser.id}`;

			setAuthUser(authUserData);
			setAccessToken(localAccessToken);
			setRefreshToken(localRefreshToken);

			saveAuthSession(JSON.stringify(authUserData), localAccessToken, localRefreshToken);

			return;
		}

		const response = await fetch('https://dummyjson.com/auth/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username,
				password,
				expiresInMins: 30,
			}),
			credentials: 'include',
		});

		const data = await response.json();

		if (!data.accessToken || !data.refreshToken || !data.id) {
			throw new Error('Autentificare esuata.');
		}

		const authUserData: AuthUser = {
			id: data.id,
			username: data.username,
			email: data.email,
			firstName: data.firstName,
			lastName: data.lastName,
		};

		setAuthUser(authUserData);
		setAccessToken(data.accessToken);
		setRefreshToken(data.refreshToken);

		saveAuthSession(
			JSON.stringify(authUserData),
			data.accessToken,
			data.refreshToken,
		);
	};

	const isAuthenticated = Boolean(authUser && accessToken);

	return {
		authUser,
		accessToken,
		refreshToken,
		isAuthenticated,
		isAuthLoaded,
		login,
		logout,
		registerLocal,
	};
};

export default useAuth;
