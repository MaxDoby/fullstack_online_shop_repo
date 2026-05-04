import express from 'express';
import router from './routes/products.routes';
import cors from 'cors';
import prisma from './lib/prisma';

const app = express();
app.use(cors());

app.use(express.json());

app.get('/health', (_req, res) => {
	res.json({
		status: 'ok',
		message: 'Mini Shop backend is running'
	})
})

app.get('/health/db', async (_req, res) => {
	try {
		await prisma.$queryRaw`SELECT 1`;

		res.json({
			status: 'ok',
			database: 'connected',
		});
	} catch (error) {
		res.status(500).json({
			status: 'error',
			database: 'disconnected',
		});
	}
});

app.use('/products', router);

export default app;
