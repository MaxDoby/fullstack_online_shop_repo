import type { Product } from '../hooks/useProducts';

interface ProductsOnPage {
    productsToShow: Product[];
    addToCart: (product: Product) => void;
    setSelectedImage: (img: string | null) => void;
}

const ProductsOnPage = ({ productsToShow, addToCart, setSelectedImage }: ProductsOnPage) => (
	<main className="product-grid">
		{productsToShow.map((product) => (
			<article key={product.id} className="product-card">
				<div className="card-glass" />
				<button type="button" className="product-image-button" onClick={() => setSelectedImage(product.thumbnail)}>
					<img src={product.thumbnail} alt={product.title} className="product-image" />
				</button>
				<h3>{product.title}</h3>
				<p className="category">{product.category}</p>
				<div
					className="price-row"
					style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 'auto',
                    }}
                >
					<span className="price" style={{ fontWeight: 'bold', color: 'var(--apricot)' }}>
						{product.price} Lei
					</span>
					<button type="button" className="btn-add" onClick={() => addToCart(product)}>
						+
					</button>
				</div>
			</article>
        ))}
	</main>
);

export default ProductsOnPage;
