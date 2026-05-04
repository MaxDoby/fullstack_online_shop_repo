import type { CartItem, OrderHistoryItem } from '../hooks/useCart';

interface CartPageProps {
	cartItems: CartItem[];
	cartTotal: number;
	removeFromCart: (productId: number) => void;
	clearCart: () => void;
	checkout: () => void;
	openShop: () => void;
	increaseCartItemQuantity: (productId: number) => void;
	decreaseCartItemQuantity: (productId: number) => void;
	orderHistory: OrderHistoryItem[];
}

const CartPage = ({
	cartItems,
	cartTotal,
	removeFromCart,
	clearCart,
	checkout,
	openShop,
	increaseCartItemQuantity,
	decreaseCartItemQuantity,
	orderHistory,
}: CartPageProps) => (
	<section className="cart-page">
		<div className="cart-page-header">
			<h2>Cosul meu</h2>
			<button type="button" className="btn-filter" onClick={openShop}>
				Inapoi la produse
			</button>
		</div>

		{cartItems.length === 0 ? (
			<p>Cosul este gol.</p>
		) : (
			<>
				<div className="cart-list">
					{cartItems.map((item) => (
						<article key={item.id} className="cart-item">
							<img src={item.thumbnail} alt={item.title} className="cart-item-image" />
							<div className="cart-item-info">
								<h3>{item.title}</h3>
								<p>Categorie: {item.category}</p>
								<p>Cantitate: {item.quantity}</p>
								<div className="cart-quantity-controls">
									<button type="button" className="btn-filter" onClick={() => decreaseCartItemQuantity(item.id)}>
										-
									</button>

									<span className="cart-quantity-value">{item.quantity}</span>

									<button type="button" className="btn-filter" onClick={() => increaseCartItemQuantity(item.id)}>
										+
									</button>
								</div>

								<p>Subtotal: {(item.price * item.quantity).toFixed(2)} Lei</p>
							</div>

							<button type="button" className="btn-filter" onClick={() => removeFromCart(item.id)}>
								Sterge
							</button>
						</article>
					))}
				</div>

				<div className="cart-summary">
					<h3>Total: {cartTotal.toFixed(2)} Lei</h3>

					<div className="cart-actions">
						<button type="button" className="btn-filter" onClick={clearCart}>
							Goleste cosul
						</button>

						<button type="button" className="btn-add" onClick={checkout}>
							Checkout
						</button>
					</div>
				</div>
			</>
		)}

		<section className="order-history-section">
			<h2>Istoric comenzi</h2>

			{orderHistory.length === 0 ? (
				<p>Nu exista comenzi salvate inca.</p>
			) : (
				<div className="order-history-list">
					{orderHistory
						.slice()
						.reverse()
						.map((order) => (
							<article key={order.id} className="order-history-card">
								<div className="order-history-header">
									<span>Comanda: {order.id}</span>
									<span>{new Date(order.createdAt).toLocaleString()}</span>
								</div>

								<p>Total: {order.total.toFixed(2)} Lei</p>

								<div className="order-history-items">
									{order.items.map((item) => (
										<div key={`${order.id}-${item.id}`} className="order-history-item">
											<span>{item.title}</span>
											<span>
												{item.quantity} x {item.price} Lei
											</span>
										</div>
									))}
								</div>
							</article>
						))}
				</div>
			)}
		</section>
	</section>
);

export default CartPage;
