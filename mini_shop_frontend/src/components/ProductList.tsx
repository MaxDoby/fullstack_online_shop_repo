import type { Product } from '../hooks/useProducts';

interface CartProductQuantity {
    id: number;
    quantity: number;
}

interface ProductsOnPage {
    productsToShow: Product[];
    cartItems: CartProductQuantity[];
    addToCart: (product: Product) => void;
    increaseCartItemQuantity: (productId: number) => void;
    decreaseCartItemQuantity: (productId: number) => void;
    openProductImageGallery: (product: Product) => void;
}

const ProductsOnPage = ({
	productsToShow,
	cartItems,
	addToCart,
	increaseCartItemQuantity,
	decreaseCartItemQuantity,
	openProductImageGallery,
}: ProductsOnPage) => {
	const getProductCartQuantity = (productId: number) => (
		cartItems.find((item) => item.id === productId)?.quantity ?? 0
	);

	const handleIncreaseProductQuantity = (
		product: Product,
		productCartQuantity: number,
	) => {
		if (productCartQuantity === 0) {
			addToCart(product);
			return;
		}

		increaseCartItemQuantity(product.id);
	};

	return (
		<main className="product-grid">
			{productsToShow.map((product) => {
				const productCartQuantity = getProductCartQuantity(product.id);

				return (
					<article key={product.id} className="product-card">
						<div className="card-glass" />
						<button type="button" className="product-image-button" onClick={() => openProductImageGallery(product)}>
							<img src={product.imageUrl} alt={product.title} className="product-image" />
						</button>
						<h3>{product.title}</h3>
						<p className="category">{product.category.name}</p>
						<div className="price-row">
							<span className="price">
								{product.price} Lei
							</span>

							<div className="product-card-actions">
								<div className="product-quantity-control" aria-label={`Cantitate in cos pentru ${product.title}`}>
									<button
										type="button"
										className="product-quantity-button"
										onClick={() => decreaseCartItemQuantity(product.id)}
										disabled={productCartQuantity === 0}
										aria-label={`Scade cantitatea pentru ${product.title}`}
                                    >
										-
									</button>

									<span className="product-quantity-value">{productCartQuantity}</span>

									<button
										type="button"
										className="product-quantity-button"
										onClick={() => handleIncreaseProductQuantity(product, productCartQuantity)}
										aria-label={`Creste cantitatea pentru ${product.title}`}
                                    >
										+
									</button>
								</div>

								<button
									type="button"
									className="btn-add btn-add-cart"
									onClick={() => addToCart(product)}
									aria-label={`Adauga ${product.title} in cos`}
                                >
									<span className="cart-button-icon" aria-hidden="true" />
								</button>
							</div>
						</div>
					</article>
				);
            })}
		</main>
	);
};

export default ProductsOnPage;
