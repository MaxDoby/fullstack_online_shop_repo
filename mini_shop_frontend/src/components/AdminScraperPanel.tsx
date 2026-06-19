import { useState, type SubmitEvent, type ChangeEvent } from 'react';
import useScraperJobs, {
	type StartScraperJobPayload,
} from '../hooks/useScraperJobs';
import useAdminCategories from '../hooks/useAdminCategories';

interface AdminScraperPanelProps {
  accessToken: string | null;
  onProductsChanged: () => void;
}

const AdminScraperPanel = ({
	accessToken,
	onProductsChanged,
}: AdminScraperPanelProps) => {
	const {
		scraperJobs,
		scraperJobsError,
		isScraperJobLoading,
		loadScraperJobs,
		startScraperJob,
		deleteScraperJob,
	} = useScraperJobs(accessToken);

	const { categories, categoriesError } = useAdminCategories();

	const [formData, setFormData] = useState({
		sourceWebsite: '',
		sourceBaseUrl: '',
		targetCategoryId: '',
		searchText: '',
		limit: '1',
	});

	const handleInputChange = (
		event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = event.target;

		setFormData((currentData) => ({
			...currentData,
			[name]: value,
		}));
	};

	const handleSubmitScraperJob = async (
		event: SubmitEvent<HTMLFormElement>,
	) => {
		event.preventDefault();

		const payload: StartScraperJobPayload = {
			sourceWebsite: formData.sourceWebsite,
			sourceBaseUrl: formData.sourceBaseUrl,
			targetCategoryId: Number(formData.targetCategoryId),
			searchText: formData.searchText.trim(),
			limit: formData.limit ? Number(formData.limit) : undefined,
		};

		await startScraperJob(payload);
	};

	return (
		<section className="admin-scraper-panel">
			<div className="admin-section-header">
				<h2>Scraper Jobs</h2>

				<div className="admin-section-actions">
					<button type="button" className="btn-filter" onClick={loadScraperJobs}>
						Refresh Jobs
					</button>

					<button type="submit" form="admin-scraper-form" className="btn-filter admin-create-button" disabled={isScraperJobLoading}>
						Start Scraper Job
					</button>
				</div>
			</div>

			{scraperJobsError && <p>{scraperJobsError}</p>}
			{categoriesError && <p>{categoriesError}</p>}

			<form id="admin-scraper-form" className="admin-scraper-form" onSubmit={handleSubmitScraperJob}>
				<div className="admin-scraper-field">
					<p className="admin-scraper-help-text">*de unde importam</p>
					<input
						name="sourceWebsite"
						value={formData.sourceWebsite}
						onChange={handleInputChange}
						placeholder="Sursa: ex: example-shop.com"
						required
                    />
				</div>

				<div className="admin-scraper-field admin-scraper-field-wide">
					<p className="admin-scraper-help-text">*adresa sursei</p>
					<input
						name="sourceBaseUrl"
						value={formData.sourceBaseUrl}
						onChange={handleInputChange}
						placeholder="https://example-shop.com"
						required
                    />
				</div>

				<div className="admin-scraper-field">
					<p className="admin-scraper-help-text">*unde vom importa</p>
					<select name="targetCategoryId" value={formData.targetCategoryId} onChange={handleInputChange} required>
						<option value="">Alege categoria interna</option>
						{categories.map((category) => (
							<option key={category.id} value={category.id}>
								{category.name}
							</option>
                        ))}
					</select>
				</div>

				<div className="admin-scraper-field admin-scraper-field-wide">
					<p className="admin-scraper-help-text">*ce cautam pe sursa</p>
					<input
						name="searchText"
						value={formData.searchText}
						onChange={handleInputChange}
						placeholder="Search query: ex: telefon samsung s21"
						required
                    />

					<p className="admin-scraper-help-text">*verifica manual intai pe sursa ca acest query returneaza produsele dorite.</p>
				</div>

				<div className="admin-scraper-field">
					<p className="admin-scraper-help-text">*cate produse importam</p>
					<input name="limit" type="number" value={formData.limit} onChange={handleInputChange} placeholder="Limita produse: ex: 10" />
				</div>
			</form>

			<div className="admin-scraper-table-wrap">
				<table className="admin-scraper-table">
					<thead>
						<tr>
							<th>ID</th>
							<th>Source</th>
							<th>Category</th>
							<th>Status</th>
							<th>Rezultat</th>
							<th>Timp</th>
							<th>Error</th>
							<th>Actions</th>
						</tr>
					</thead>

					<tbody>
						{scraperJobs.map((job) => (
							<tr key={job.id}>
								<td>{job.id}</td>
								<td>{job.sourceWebsite}</td>
								<td>{job.targetCategory?.name ?? '-'}</td>
								<td>{job.status}</td>
								<td className="admin-scraper-stats-cell">
									<span><strong>Found:</strong> {job.totalFound}</span>
									<span><strong>Imported:</strong> {job.totalImported}</span>
									<span><strong>Updated:</strong> {job.totalUpdated}</span>
									<span><strong>Failed:</strong> {job.totalFailed}</span>
								</td>
								<td className="admin-scraper-time-cell">
									<span><strong>Created:</strong> {new Date(job.createdAt).toLocaleString()}</span>
									<span>
										<strong>Finished:</strong>
										{' '}
										{job.finishedAt ? new Date(job.finishedAt).toLocaleString() : '-'}
									</span>
								</td>
								<td className="admin-scraper-error-cell" title={job.errorMessage ?? undefined}>
									{job.errorMessage ?? '-'}
								</td>
								<td className="admin-scraper-actions-cell">
									{job.status === 'COMPLETED' && (
									<button type="button" className="btn-filter admin-scraper-action-button" onClick={onProductsChanged}>
										Reload Products
									</button>
                                    )}

									<button
										type="button"
										className="btn-filter admin-scraper-action-button admin-scraper-delete-button"
										onClick={() => deleteScraperJob(job.id)}
                                    >
										Delete
									</button>
								</td>
							</tr>
                        ))}
					</tbody>
				</table>
			</div>
		</section>
	);
};

export default AdminScraperPanel;
