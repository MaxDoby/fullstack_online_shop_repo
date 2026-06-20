const CartIcon = () => (
	<svg
		className="cart-button-icon"
		viewBox="0 0 24 24"
		aria-hidden="true"
		focusable="false"
	>
		<path d="M3 5h2.6l2 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H7" />
		<circle className="cart-button-wheel" cx="9.5" cy="20" r="2.2" />
		<circle className="cart-button-wheel" cx="18" cy="20" r="2.2" />
	</svg>
);

export default CartIcon;
