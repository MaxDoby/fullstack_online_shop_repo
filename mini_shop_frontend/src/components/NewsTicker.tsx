import { useEffect, useState } from 'react';

interface NewsItem {
    title: string;
    url: string;
    source: string;
}

const fallbackMessages = [
	'Reduceri de pana la 50% la categoria Laptops!',
	'Transport gratuit la comenzi de peste 200 RON!',
	'Noi produse adaugate zilnic in stoc!',
	'Verifica noile accesorii pentru Smartwatch!',
];

const NewsTicker = () => {
	const [messages, setMessages] = useState<string[]>(fallbackMessages);

	useEffect(() => {
		const loadNews = async () => {
			try {
				const response = await fetch('/api/news');

				if (!response.ok) return;

				const news: NewsItem[] = await response.json();
				const newsTitles = news.map((item) => item.title).filter(Boolean);

				if (newsTitles.length > 0) {
					setMessages(newsTitles);
				}
			} catch {
				setMessages(fallbackMessages);
			}
		};

		loadNews();
	}, []);

	return (
		<div className="news-ticker-container">
			<div className="news-ticker">
				<span>{messages.join(' - ')} - </span>
				<span>{messages.join(' - ')} - </span>
			</div>
		</div>
	);
};

export default NewsTicker;
