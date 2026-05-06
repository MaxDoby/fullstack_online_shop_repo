import express from 'express';
import router from './routes/products.routes';
import cors from 'cors';
import prisma from './lib/prisma';

const app = express();
app.use(cors());

app.use(express.json());

app.get('/health', async (_req, res) => {
	try {
		await prisma.$queryRaw`SELECT 1`;

		res.status(200).json({
			api: {
				status: 'up'
			},
			database: {
				status: 'up'
			}
		});
	} catch (error) {
		console.error('Database healthcheck failed:', error);

		res.status(500).json({
            api: {
                status: 'up',
            },
            database: {
                status: 'down',
            }, error: 'Database connection failed',
        });
	}
});

app.use('/products', router);

export default app;
