interface HeaderProps {
	cartCount: number;
	openCart: () => void;
	openShop: () => void;
	openAuth: () => void;
	logout: () => void;
	isAuthenticated: boolean;
	authUsername: string | null;
	openAdmin: () => void;
	isAdmin: boolean;
}

const Header = ({
	cartCount, openCart, openShop, openAuth, logout, isAuthenticated, authUsername, openAdmin, isAdmin,
}: HeaderProps) => (
	<header className="header">
		<button type="button" className="logo-link header-reset-button" onClick={openShop}>
			<div className="logo">
				<span className="logo-icon">⚡</span>
				Tech
				<span>Flow</span>
			</div>
		</button>

		<div className="cart-indicator">
			<button type="button" className="cart-icon-button header-reset-button" onClick={openCart} aria-label="Deschide cosul">
				<span className="cart-icon">🛒</span>
			</button>

			<span>Checkout:</span>
			<span className="cart-count">{cartCount}</span>
		</div>

		<div className="auth-indicator">
			{isAuthenticated ? (
				<>
					<span className="auth-user-name">{authUsername ? `Salut, ${authUsername}` : 'Cont activ'}</span>

					{isAdmin && (
					<button type="button" className="btn-filter" onClick={openAdmin}>
						Admin
					</button>
                    )}

					<button type="button" className="btn-filter" onClick={logout}>
						Logout
					</button>
				</>
            ) : (
	<button type="button" className="btn-filter" onClick={openAuth}>
		Login / Register
	</button>
            )}
		</div>
	</header>
);

export default Header;
