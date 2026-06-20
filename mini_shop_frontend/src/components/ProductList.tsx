import type { Product } from '../hooks/useProducts';
import CartIcon from './CartIcon';

interface ProductsOnPage {
    productsToShow: Product[];
    addToCart: (product: Product) => void;
    openProductImageGallery: (product: Product) => void;
}

const ProductsOnPage = ({ productsToShow, addToCart, openProductImageGallery }: ProductsOnPage) => (
	<main className="product-grid">
		{productsToShow.map((product) => (
			<article key={product.id} className="product-card">
				<div className="card-glass" />
				<button type="button" className="product-image-button" onClick={() => openProductImageGallery(product)}>
					<img src={product.imageUrl} alt={product.title} className="product-image" />
				</button>
				<h3>{product.title}</h3>

				<p className="category">{product.category.name}</p>

				<div className="price-row">
					<span className="price">{product.price} Lei</span>

					<div className="product-card-actions">
						<button
							type="button"
							className="btn-add btn-add-cart"
							onClick={() => addToCart(product)}
							aria-label={`Adauga ${product.title} in cos`}
                        >
							<CartIcon />
						</button>
					</div>
				</div>
			</article>
        ))}
	</main>
);

export default ProductsOnPage;
