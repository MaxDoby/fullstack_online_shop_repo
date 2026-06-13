import { useEffect, useState } from 'react';

export interface ScraperJob {
    id: number;
    sourceWebsite: string;
    sourceBaseUrl: string;
    targetCategory: {
        id: number;
        name: string;
    } | null;
    manufacturer: string | null;
    productType: string | null;
    searchText: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELED';
    totalFound: number;
    totalImported: number;
    totalUpdated: number;
    totalFailed: number;
    errorMessage: string | null;
    createdAt: string;
    finishedAt: string | null;
}

export interface StartScraperJobPayload {
    sourceWebsite: string;
    sourceBaseUrl: string;
    targetCategoryId: number;
    productType?: string;
    manufacturer?: string;
    model?: string;
    searchText?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
}

const apiBaseUrl = '/api';

const useScraperJobs = (accessToken: string | null) => {
	const [scraperJobs, setScraperJobs] = useState<ScraperJob[]>([]);
	const [scraperJobsError, setScraperJobsError] = useState<string | null>(null);
	const [isScraperJobLoading, setIsScraperJobLoading] = useState<boolean>(false);

	const loadScraperJobs = async () => {
		if (!accessToken) return;

		const response = await fetch(`${apiBaseUrl}/scraper/jobs`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) throw new Error('Scraper jobs load failed.');

		const jobs: ScraperJob[] = await response.json();
		setScraperJobs(jobs);
	};

	const startScraperJob = async (payload: StartScraperJobPayload) => {
		if (!accessToken) throw new Error('Admin authentication is required.');

		setIsScraperJobLoading(true);
		setScraperJobsError(null);

		try {
			const response = await fetch(`${apiBaseUrl}/scraper/jobs`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) throw new Error('Scraper job start failed.');

			await loadScraperJobs();
		} catch (error) {
			setScraperJobsError(error instanceof Error ? error.message : 'Unknown scraper error.');
		} finally {
			setIsScraperJobLoading(false);
		}
	};

	const deleteScraperJob = async (jobId: number) => {
		if (!accessToken) throw new Error('Admin authentication is required.');

		const response = await fetch(`${apiBaseUrl}/scraper/jobs/${jobId}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) throw new Error('Scraper job delete failed.');

		setScraperJobs((currentJobs) => currentJobs.filter((job) => job.id !== jobId));
	};

	useEffect(() => {
		if (!accessToken) return;

		loadScraperJobs().catch((error: unknown) => {
			setScraperJobsError(error instanceof Error ? error.message : 'Scraper jobs load failed.');
		});
	}, [accessToken]);

	return {
		scraperJobs,
		scraperJobsError,
		isScraperJobLoading,
		loadScraperJobs,
		startScraperJob,
		deleteScraperJob,
	};
};

export default useScraperJobs;
