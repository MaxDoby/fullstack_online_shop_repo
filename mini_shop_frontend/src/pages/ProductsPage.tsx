import { useEffect } from 'react';
import FilterNav from '../components/FilterNav';
import ProductsOnPage from '../components/ProductList';
import type { Product } from '../hooks/useProducts.ts';

interface ProductsPageProps {
    filters: {
        categories: string[];
        filterProducts: (cat: string) => void;
    };
    productsView: {
        products: Product[];
        cartItems: { id: number; quantity: number }[];
        addToCart: (product: Product) => void;
        increaseCartItemQuantity: (productId: number) => void;
        decreaseCartItemQuantity: (productId: number) => void;
        openProductImageGallery: (product: Product) => void;
    };
    pagination: {
        currentPage: number;
        setCurrentPage: (page: number) => void;
        totalPages: number;
    };
}

const ProductsPage = ({ filters, productsView, pagination }: ProductsPageProps) => {
	const goToPage = (page: number) => {
		pagination.setCurrentPage(page);
	};

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [pagination.currentPage]);

	return (
		<div className="main-layout">
			<aside className="sidebar">
				<h3 className="sidebar-title">Categorii</h3>
				<FilterNav categories={filters.categories} filterProducts={filters.filterProducts} />
			</aside>

			<main className="content-area">
				<ProductsOnPage
					productsToShow={productsView.products}
					cartItems={productsView.cartItems}
					addToCart={productsView.addToCart}
					increaseCartItemQuantity={productsView.increaseCartItemQuantity}
					decreaseCartItemQuantity={productsView.decreaseCartItemQuantity}
					openProductImageGallery={productsView.openProductImageGallery}
                />

				<div className="pagination-container">
					<button
						type="button"
						className="btn-filter"
						onClick={() => goToPage(pagination.currentPage - 1)}
						disabled={pagination.currentPage === 1}
                    >
						Inapoi
					</button>

					<span className="page-info">
						Pagina {pagination.currentPage} din {pagination.totalPages || 1}
					</span>

					<button
						type="button"
						className="btn-filter"
						onClick={() => goToPage(pagination.currentPage + 1)}
						disabled={pagination.currentPage === pagination.totalPages}
                    >
						Inainte
					</button>
				</div>
			</main>
		</div>
	);
};

export default ProductsPage;
