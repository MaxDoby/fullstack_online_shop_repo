const Footer = () => {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="app-footer">
			<h5>⚡ TechFlow {currentYear}</h5>
		</footer>
	);
};

export default Footer;
