import {
	Fragment,
	useRef,
	useState,
	type SubmitEvent,
} from 'react';
import useAdminProducts from '../hooks/useAdminProducts';
import useAdminProductForm from '../hooks/useAdminProductForm';
import AdminScraperPanel from '../components/AdminScraperPanel';

interface AdminPageProps {
	accessToken: string | null;
	onProductsChanged: () => void;
}

const apiBaseUrl = '/api';

const AdminPage = ({ accessToken, onProductsChanged }: AdminPageProps) => {
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const adminProductsTableRef = useRef<HTMLTableElement | null>(null);
	const [previewImageId, setPreviewImageId] = useState<number | null>(null);
	const [adminActionError, setAdminActionError] = useState<string | null>(null);
	const [adminActionSuccess, setAdminActionSuccess] = useState<string | null>(null);
	const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
	const {
		adminProducts,
		adminProductsError, deleteAdminProduct, createAdminProduct, uploadAdminProductImage, updateAdminProduct,
		selectedProductIdForImages, selectedProductImages, loadProductImages,
		deleteAdminProductImage, setPrimaryProductImage,
		adminProductsPage, adminProductsTotalPages, setAdminProductsPage, reloadAdminProducts,
	} = useAdminProducts();

	const {
		formData,
		handleInputChange, resetForm, getCreateProductPayload, handleFileChange, editingProductId, startEditingProduct,
	} = useAdminProductForm();

	const handleProductsChanged = () => {
		reloadAdminProducts();
		onProductsChanged();
	};

	const handleAdminProductsPageChange = (page: number) => {
		setAdminProductsPage(page);
		setSelectedProductIds([]);
		const tableTop = adminProductsTableRef.current?.getBoundingClientRect().top ?? 0;
		const scrollTarget = window.scrollY + tableTop - 140;

		window.scrollTo({
			top: scrollTarget,
			behavior: 'smooth',
		});
	};

	const handlePrimaryImage = async (imageId: number) => {
		if (!accessToken) return;

		setAdminActionError(null);
		setAdminActionSuccess(null);

		try {
			await setPrimaryProductImage(imageId, accessToken);
			handleProductsChanged();
			setAdminActionSuccess('Primary image updated.');
		} catch (error) {
			setAdminActionError(error instanceof Error ? error.message : 'Primary image update failed.');
		}
	};

	const handleDeleteProduct = async (productId: number) => {
		if (!accessToken) return;

		await deleteAdminProduct(productId, accessToken);
	};

	const handleToggleProductSelection = (productId: number) => {
		setSelectedProductIds((currentIds) => {
			if (currentIds.includes(productId)) {
				return currentIds.filter((id) => id !== productId);
			}

			return [...currentIds, productId];
		});
	};

	const handleDeleteSelectedProducts = async () => {
		if (!accessToken || selectedProductIds.length === 0) return;

		setAdminActionError(null);
		setAdminActionSuccess(null);

		try {
			await Promise.all(selectedProductIds.map((productId) => deleteAdminProduct(productId, accessToken)));

			setSelectedProductIds([]);
			handleProductsChanged();
			setAdminActionSuccess('Selected products deleted.');
		} catch (error) {
			setAdminActionError(error instanceof Error ? error.message : 'Selected products delete failed.');
		}
	};

	const handleCreateProduct = async (accessTokenValue: string) => {
		const payload = getCreateProductPayload();

		const createdProduct = await createAdminProduct(payload, accessTokenValue);

		if (formData.imageFile) {
			await uploadAdminProductImage(createdProduct.id, formData.imageFile, accessTokenValue);
			await loadProductImages(createdProduct.id);
		}

		handleProductsChanged();
		setAdminActionSuccess('Product created.');
		resetForm();
	};

	const handleUpdateProduct = async (productId: number, accessTokenValue: string) => {
		const payload = getCreateProductPayload();

		await updateAdminProduct(productId, payload, accessTokenValue);

		if (formData.imageFile) {
			await uploadAdminProductImage(productId, formData.imageFile, accessTokenValue);
			await loadProductImages(productId);
		}

		handleProductsChanged();
		setAdminActionSuccess('Product updated.');
		resetForm();
	};

	const handleSubmitProductForm = async (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!accessToken) return;

		setAdminActionError(null);
		setAdminActionSuccess(null);

		try {
			if (editingProductId) {
				await handleUpdateProduct(editingProductId, accessToken);
				return;
			}

			await handleCreateProduct(accessToken);
		} catch (error) {
			setAdminActionError(error instanceof Error ? error.message : 'Admin action failed.');
		}
	};

	const handleLoadProductImages = async (productId: number) => {
		setAdminActionError(null);
		setAdminActionSuccess(null);
		setPreviewImageId(null);

		if (selectedProductIdForImages === productId) {
			await loadProductImages(null);
			return;
		}

		try {
			await loadProductImages(productId);
		} catch (error) {
			setAdminActionError(error instanceof Error ? error.message : 'Product images load failed.');
		}
	};

	const handleDeleteImage = async (imageId: number) => {
		if (!accessToken) return;

		setAdminActionError(null);
		setAdminActionSuccess(null);

		try {
			await deleteAdminProductImage(imageId, accessToken);
			handleProductsChanged();
			setPreviewImageId(null);
			setAdminActionSuccess('Image deleted.');
		} catch (error) {
			setAdminActionError(error instanceof Error ? error.message : 'Image delete failed.');
		}
	};

	return (
		<>
			<main className="admin-page">
				<h1>Admin Panel</h1>
				<p>Gestionare produse, imagini si comenzi</p>

				{adminProductsError && <p>{adminProductsError}</p>}
				{adminActionError && <p>{adminActionError}</p>}
				{adminActionSuccess && <p>{adminActionSuccess}</p>}

				<AdminScraperPanel accessToken={accessToken} onProductsChanged={handleProductsChanged} />

				<h2>Creati sau modificati un produs.</h2>
				<form className="admin-product-form" onSubmit={handleSubmitProductForm}>
					<input name="title" value={formData.title} onChange={handleInputChange} placeholder="Title" />

					<input name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" />

					<input name="price" type="number" value={formData.price} onChange={handleInputChange} placeholder="Price" />

					<input name="stock" type="number" value={formData.stock} onChange={handleInputChange} placeholder="Stock" />

					<input name="category" value={formData.category} onChange={handleInputChange} placeholder="Category" />

					<div className="admin-file-control">
						<button type="button" className="admin-file-button" onClick={() => fileInputRef.current?.click()}>
							Alegeti fisierul
						</button>
						<span className="admin-file-name">{formData.imageFile ? formData.imageFile.name : 'Niciun fisier ales'}</span>
						<input ref={fileInputRef} name="imageFile" type="file" accept="image/*" onChange={handleFileChange} />
					</div>

					<div className="admin-form-actions">
						<button type="submit" className="btn-filter admin-create-button">
							{editingProductId ? 'Update Product' : 'Create Product'}
						</button>

						{editingProductId && (
						<button type="button" className="admin-cancel-button" onClick={resetForm}>
							Cancel Edit
						</button>
                        )}
					</div>
				</form>

				<div className="admin-bulk-actions">
					<button
						type="button"
						className="btn-filter"
						onClick={() => handleAdminProductsPageChange(adminProductsPage - 1)}
						disabled={adminProductsPage === 1}
                    >
						Inapoi
					</button>

					<span className="page-info">
						Pagina {adminProductsPage} din {adminProductsTotalPages || 1}
					</span>

					<button
						type="button"
						className="btn-filter"
						onClick={() => handleAdminProductsPageChange(adminProductsPage + 1)}
						disabled={adminProductsPage === adminProductsTotalPages}
                    >
						Inainte
					</button>
					<span>{selectedProductIds.length}/10 selected</span>

					<button
						type="button"
						className="btn-filter admin-bulk-delete-button"
						onClick={handleDeleteSelectedProducts}
						disabled={selectedProductIds.length === 0}
                    >
						Delete selected
					</button>
				</div>

				<table ref={adminProductsTableRef}>
					<thead>
						<tr>
							<th>Select</th>
							<th>ID</th>
							<th>Title</th>
							<th>Category</th>
							<th>Price</th>
							<th>Stock</th>
							<th>Actions</th>
						</tr>
					</thead>

					<tbody>
						{adminProducts.map((product) => (
							<Fragment key={product.id}>
								<tr>
									<td>
										<input
											type="checkbox"
											aria-label={`Select product ${product.id}`}
											checked={selectedProductIds.includes(product.id)}
											onChange={() => handleToggleProductSelection(product.id)}
											disabled={!selectedProductIds.includes(product.id) && selectedProductIds.length >= 10}
                                        />
									</td>
									<td>{product.id}</td>
									<td>{product.title}</td>
									<td>{product.category.name}</td>
									<td>{product.price}</td>
									<td>{product.stock}</td>
									<td>
										<button type="button" className="btn-filter" onClick={() => handleLoadProductImages(product.id)}>
											Images
										</button>
										<button type="button" className="btn-filter" onClick={() => startEditingProduct(product)}>
											Edit
										</button>
										<button type="button" className="btn-filter" onClick={() => handleDeleteProduct(product.id)}>
											Delete
										</button>
									</td>
								</tr>

								{selectedProductIdForImages === product.id && (
								<tr className="admin-product-images-row">
									<td colSpan={7}>
										<section className="admin-product-images">
											<h2>Product Images #{selectedProductIdForImages}</h2>

											{selectedProductImages.length === 0 ? (
												<p>No images attached to this product.</p>
                                                ) : (
	<div className="admin-product-images-grid">
		{selectedProductImages.map((image) => (
			<article key={image.id} className="admin-product-image-card">
				<button
					type="button"
					className="admin-product-image-preview-button"
					onClick={() => setPreviewImageId(image.id)}
                                                                >
					<img src={`${apiBaseUrl}/images/${image.id}/120/90`} alt={image.originalName} />
				</button>

				<span className="admin-product-image-name">{image.originalName}</span>

				{image.isPrimary && <span className="admin-primary-badge">Primary</span>}

				<div className="admin-image-actions">
					<button
						type="button"
						className="btn-filter"
						onClick={() => handlePrimaryImage(image.id)}
						disabled={image.isPrimary}
                                                                    >
						Set primary
					</button>

					<button
						type="button"
						className="btn-filter admin-image-delete-button"
						onClick={() => handleDeleteImage(image.id)}
                                                                    >
						Delete
					</button>
				</div>
			</article>
                                                        ))}
	</div>
                                                )}
										</section>
									</td>
								</tr>
                                )}
							</Fragment>
                        ))}
					</tbody>
				</table>

				<div className="pagination-container admin-products-pagination">
					<button
						type="button"
						className="btn-filter"
						onClick={() => handleAdminProductsPageChange(adminProductsPage - 1)}
						disabled={adminProductsPage === 1}
                    >
						Inapoi
					</button>

					<span className="page-info">
						Pagina {adminProductsPage} din {adminProductsTotalPages || 1}
					</span>

					<button
						type="button"
						className="btn-filter"
						onClick={() => handleAdminProductsPageChange(adminProductsPage + 1)}
						disabled={adminProductsPage === adminProductsTotalPages}
                    >
						Inainte
					</button>
				</div>
			</main>

			{previewImageId && (
			<div
				role="button"
				tabIndex={0}
				className="admin-image-preview-overlay"
				onClick={() => setPreviewImageId(null)}
				onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === 'Escape') {
                            setPreviewImageId(null);
                        }
                    }}
				aria-label="Close image preview"
                >
				<div
					role="presentation"
					className="admin-image-preview"
					onClick={(event) => event.stopPropagation()}
					onKeyDown={(event) => event.stopPropagation()}
                    >
					<button type="button" className="admin-image-preview-close" onClick={() => setPreviewImageId(null)}>
						X
					</button>
					<img src={`${apiBaseUrl}/images/${previewImageId}/500/350`} alt="Selected product preview" />
				</div>
			</div>
			)}
		</>
	);
};

export default AdminPage;
