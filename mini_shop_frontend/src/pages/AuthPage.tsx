import { useState, type SyntheticEvent } from 'react';

interface AuthPageProps {
	login: (username: string, password: string) => Promise<void>;
	registerLocal: (
		username: string,
		password: string,
		email: string,
		firstName: string,
		lastName: string,
	) => Promise<void>;
	isAuthenticated: boolean;
	openShop: () => void;
}

const AuthPage = ({
	login,
	registerLocal,
	isAuthenticated,
	openShop,
}: AuthPageProps) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [mode, setMode] = useState<'login' | 'register'>('login');
	const [email, setEmail] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');

	const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		setErrorMessage('');
		setIsSubmitting(true);

		try {
			if (mode === 'login') {
				await login(username, password);
			} else {
				await registerLocal(username, password, email, firstName, lastName);
			}
		} catch (error) {
			if (error instanceof Error) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage('Operatiunea a esuat.');
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleModeChange = (newMode: 'login' | 'register') => {
		setMode(newMode);
		setErrorMessage('');
		setUsername('');
		setPassword('');
		setEmail('');
		setFirstName('');
		setLastName('');
	};

	let submitButtonText = 'Register';

	if (isSubmitting) {
		submitButtonText = 'Se proceseaza...';
	} else if (mode === 'login') {
		submitButtonText = 'Login';
	}

	let authContent;

	if (isAuthenticated) {
		authContent = <p>Esti deja autentificat.</p>;
	} else if (mode === 'login') {
		authContent = (
			<>
				<h2>Autentificare</h2>

				<form className="auth-form" onSubmit={handleSubmit}>
					<input
						type="text"
						placeholder="Username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className="search-input"
					/>

					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="search-input"
					/>

					{errorMessage && <p className="auth-error">{errorMessage}</p>}

					<button type="submit" className="btn-add" disabled={isSubmitting}>
						{submitButtonText}
					</button>
				</form>

				<p className="auth-helper-text">
					Nu ai inca un cont?{' '}
					<button
						type="button"
						className="auth-inline-button"
						onClick={() => handleModeChange('register')}
					>
						Register
					</button>
				</p>
			</>
		);
	} else {
		authContent = (
			<>
				<h2>Creare cont:</h2>

				<form className="auth-form" onSubmit={handleSubmit}>
					<input
						type="text"
						placeholder="First name"
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
						className="search-input"
					/>

					<input
						type="text"
						placeholder="Last name"
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
						className="search-input"
					/>

					<input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="search-input"
					/>

					<input
						type="text"
						placeholder="Username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className="search-input"
					/>

					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="search-input"
					/>

					{errorMessage && <p className="auth-error">{errorMessage}</p>}

					<button type="submit" className="btn-add" disabled={isSubmitting}>
						{submitButtonText}
					</button>
				</form>

				<p className="auth-helper-text">
					Ai deja cont?{' '}
					<button
						type="button"
						className="auth-inline-button"
						onClick={() => handleModeChange('login')}
					>
						Login
					</button>
				</p>
			</>
		);
	}

	return (
		<section className="auth-page">
			<div className="auth-card">
				<button type="button" className="btn-filter auth-back-button" onClick={openShop}>
					Inapoi la produse
				</button>
				{authContent}
			</div>
		</section>
	);
};

export default AuthPage;
