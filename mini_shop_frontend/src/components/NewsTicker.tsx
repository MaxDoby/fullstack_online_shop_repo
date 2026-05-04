const NewsTicker = () => {
	const message = [
		'🔥 Reduceri de pana la 50% la categoria Laptops!',
		'🚀 Transport gratuit la comenzi de peste 200 RON!',
		'💎 Noi produse adaugate zilnic in stoc!',
		'📱 Verifica noile accesorii pentru Smartwatch!',
	];

	return (
		<div className="news-ticker-container">
			<div className="news-ticker">
				<span>{message.join(' - ')} - </span>
				<span>{message.join(' - ')} - </span>
			</div>
		</div>
	);
};

export default NewsTicker;
