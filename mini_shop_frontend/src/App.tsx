import './App.css';

import {
	Navigate, Routes, Route, useNavigate,
} from 'react-router-dom';
import AuthPage from './pages/AuthPage.tsx';
import useAuth from './hooks/useAuth.ts';

import Footer from './components/Footer.tsx';
import Header from './components/Header.tsx';
import NewsTicker from './components/NewsTicker.tsx';
import SearchCont from './components/SearchCont.tsx';
import CartPage from './pages/CartPage.tsx';
import ProductsPage from './pages/ProductsPage.tsx';

import useProducts from './hooks/useProducts.ts';
import useCart from './hooks/useCart.ts';

import logicFilterProducts from './utils/productFilters.ts';

const App = () => {
	const navigate = useNavigate();

	const productsState = useProducts();
	const authState = useAuth();
	const cartState = useCart(authState.authUser?.id ?? null, authState.accessToken);

	const {
		products,
		categories,
		searchQuery,
		setSearchQuery,
		currentPage,
		setCurrentPage,
		selectedImage,
		setSelectedImage,
		setActiveCategory,
		totalPages,
	} = productsState;

	const {
		cartItems,
		cartTotal,
		cartCount,
		addToCart,
		removeFromCart,
		clearCart,
		checkout,
		increaseCartItemQuantity,
		decreaseCartItemQuantity,
		orderHistory,
	} = cartState;

	const {
		login,
		logout,
		isAuthenticated,
		authUser,
		registerLocal,
	} = authState;

	const filterProducts = (cat: string) => {
		logicFilterProducts(cat, setActiveCategory, setCurrentPage, setSearchQuery);
	};

	const handleCheckout = async () => {
		if (!isAuthenticated) {
			alert('Autentificati-va sau creati un cont pentru a plasa comanda.');
			navigate('/auth');
			return;
		}

		checkout();
		navigate('/products');
	};

	const handleLogin = async (username: string, password: string) => {
		await login(username, password);
		navigate('/products');
	};

	const handleRegister = async (
		username: string,
		password: string,
		email: string,
		firstName: string,
		lastName: string,
	) => {
		await registerLocal(username, password, email, firstName, lastName);
		navigate('/products');
	};

	const productsPageFilters = {
		categories,
		filterProducts,
	};

	const productsPageView = {
		products,
		addToCart,
		setSelectedImage,
	};

	const productsPagePagination = {
		currentPage,
		setCurrentPage,
		totalPages,
	};

	return (
		<div className="app-container">
			<div className="bg-animated" />

			<Header
				cartCount={cartCount}
				openCart={() => navigate('/cart')}
				openShop={() => navigate('/products')}
				openAuth={() => navigate('/auth')}
				logout={logout}
				isAuthenticated={isAuthenticated}
				authUsername={authUser?.username || null}
			/>

			<NewsTicker />

			<SearchCont searchQuery={searchQuery} setSearchQuery={setSearchQuery} setCurrentPage={setCurrentPage} />

			<Routes>
				<Route
					path="/products"
					element={(
						<ProductsPage
							filters={productsPageFilters}
							productsView={productsPageView}
							pagination={productsPagePagination}
						/>
					)}
				/>
				<Route
					path="/cart"
					element={(
						<CartPage
							cartItems={cartItems}
							cartTotal={cartTotal}
							removeFromCart={removeFromCart}
							clearCart={clearCart}
							increaseCartItemQuantity={increaseCartItemQuantity}
							decreaseCartItemQuantity={decreaseCartItemQuantity}
							orderHistory={orderHistory}
							openShop={() => navigate('/products')}
							checkout={handleCheckout}
						/>
					)}
				/>
				<Route
					path="/auth"
					element={(
						<AuthPage
							login={handleLogin}
							registerLocal={handleRegister}
							isAuthenticated={isAuthenticated}
							openShop={() => navigate('/products')}
						/>
					)}
				/>

				<Route path="*" element={<Navigate to="/products" replace />} />
			</Routes>

			<Footer />

			{selectedImage && (
				<button
					type="button"
					className="modal-overlay"
					onClick={() => setSelectedImage(null)}
					aria-label="ГЋnchide imaginea"
				>
					<span className="modal-content">
						<img src={selectedImage} alt="Preview" />
					</span>
				</button>
			)}
		</div>
	);
};

export default App;
