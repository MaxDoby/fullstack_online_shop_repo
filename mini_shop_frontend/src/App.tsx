import './App.css';

import {
	Navigate, Routes, Route, useNavigate, useLocation,
} from 'react-router-dom';
import AuthPage from './pages/AuthPage.tsx';
import useAuth from './hooks/useAuth.ts';

import Footer from './components/Footer.tsx';
import Header from './components/Header.tsx';
import NewsTicker from './components/NewsTicker.tsx';
import SearchCont from './components/SearchCont.tsx';
import CartPage from './pages/CartPage.tsx';
import ProductsPage from './pages/ProductsPage.tsx';
import AdminPage from './pages/AdminPage.tsx';

import useProducts from './hooks/useProducts.ts';
import useCart from './hooks/useCart.ts';

import logicFilterProducts from './utils/productFilters.ts';

const App = () => {
	const navigate = useNavigate();

	const location = useLocation();
	const isAdminPage = location.pathname === '/admin';

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
		selectedImageGallery,
		setSelectedImage,
		setActiveCategory,
		totalPages,
		reloadProducts,
		openProductImageGallery,
		resetProductsView,
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
		accessToken,
		isAuthLoaded,
	} = authState;

	const filterProducts = (cat: string) => {
		logicFilterProducts(cat, setActiveCategory, setCurrentPage, setSearchQuery);
	};

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const handleOpenShop = () => {
		resetProductsView();
		navigate('/products');
		window.scrollTo({ top: 0, behavior: 'smooth' });
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
		cartItems,
		addToCart,
		increaseCartItemQuantity,
		decreaseCartItemQuantity,
		openProductImageGallery,
	};

	const productsPagePagination = {
		currentPage,
		setCurrentPage,
		totalPages,
	};

	let adminRouteElement = null;

	if (isAuthLoaded) {
		if (authUser?.role === 'ADMIN') {
			adminRouteElement = <AdminPage accessToken={accessToken} onProductsChanged={reloadProducts} />;
		} else {
			adminRouteElement = <Navigate to="/products" replace />;
		}
	}

	return (
		<div className="app-container">
			<div className="bg-animated" />

			<Header
				cartCount={cartCount}
				openCart={() => navigate('/cart')}
				openShop={handleOpenShop}
				openAuth={() => navigate('/auth')}
				logout={logout}
				isAuthenticated={isAuthenticated}
				authUsername={authUser?.firstName || authUser?.username || null}
				openAdmin={() => navigate('/admin')}
				isAdmin={authUser?.role === 'ADMIN'}
				scrollToTop={scrollToTop}
            />

			<NewsTicker />

			{!isAdminPage && <SearchCont searchQuery={searchQuery} setSearchQuery={setSearchQuery} setCurrentPage={setCurrentPage} />}

			<Routes>
				<Route
					path="/products"
					element={<ProductsPage filters={productsPageFilters} productsView={productsPageView} pagination={productsPagePagination} />}
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
				<Route path="/admin" element={adminRouteElement} />

				<Route path="*" element={<Navigate to="/products" replace />} />
			</Routes>

			<Footer />

			{selectedImage && (
			<button type="button" className="modal-overlay" onClick={() => setSelectedImage(null)} aria-label="ГЋnchide imaginea">
				<span className="modal-content" role="presentation" onClick={(event) => event.stopPropagation()}>
					<img src={selectedImage} alt="Preview" />

					{selectedImageGallery.length > 1 && (
					<span className="modal-thumbnails">
						{selectedImageGallery.map((imageUrl) => (
							<button
								type="button"
								key={imageUrl}
								className="modal-thumbnail-button"
								onClick={() => setSelectedImage(imageUrl)}
                                    >
								<img src={imageUrl} alt="Product thumbnail" />
							</button>
                                ))}
					</span>
                        )}
				</span>
			</button>
            )}
		</div>
	);
};

export default App;
