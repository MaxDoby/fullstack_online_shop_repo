import express from 'express';
import router from './routes/products.routes';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
	res.json({
		status: 'ok',
		message: 'Mini Shop backend is running'
	})
})

app.use('/products', router);

export default app;
