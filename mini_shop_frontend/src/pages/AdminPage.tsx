import { useRef, type SubmitEvent } from 'react';
import useAdminProducts from '../hooks/useAdminProducts';
import useAdminProductForm from '../hooks/useAdminProductForm';

interface AdminPageProps {
    accessToken: string | null;
}

const AdminPage = ({ accessToken }: AdminPageProps) => {
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const {
		adminProducts, adminProductsError, deleteAdminProduct, createAdminProduct, uploadAdminProductImage,
	} = useAdminProducts();

	const {
		formData, handleInputChange, resetForm, getCreateProductPayload, handleFileChange,
	} = useAdminProductForm();

	const handleDeleteProduct = async (productId: number) => {
		if (!accessToken) return;

		await deleteAdminProduct(productId, accessToken);
	};

	const handleCreateProduct = async (event: SubmitEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!accessToken) return;

		const payload = getCreateProductPayload();

		const createdProduct = await createAdminProduct(payload, accessToken);

		if (formData.imageFile) {
			await uploadAdminProductImage(createdProduct.id, formData.imageFile, accessToken);
		}

		resetForm();
	};

	return (
		<main className="admin-page">
			<h1>Admin Panel</h1>
			<p>Gestionare produse, imagini si comenzi</p>

			{adminProductsError && <p>{adminProductsError}</p>}

			<form className="admin-product-form" onSubmit={handleCreateProduct}>
				<input name="title" value={formData.title} onChange={handleInputChange} placeholder="Title" />

				<input name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" />

				<input name="price" type="number" value={formData.price} onChange={handleInputChange} placeholder="Price" />

				<input name="stock" type="number" value={formData.stock} onChange={handleInputChange} placeholder="Stock" />

				<input name="category" value={formData.category} onChange={handleInputChange} placeholder="Category" />

				<div className="admin-file-control">
					<button
						type="button"
						className="admin-file-button"
						onClick={() => fileInputRef.current?.click()}
					>
						Alegeti fisierul
					</button>
					<span className="admin-file-name">{formData.imageFile ? formData.imageFile.name : 'Niciun fisier ales'}</span>
					<input
						ref={fileInputRef}
						name="imageFile"
						type="file"
						accept="image/*"
						onChange={handleFileChange}
					/>
				</div>

				<button type="submit" className="btn-filter admin-create-button">
					Create Product
				</button>
			</form>

			<table>
				<thead>
					<tr>
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
						<tr key={product.id}>
							<td>{product.id}</td>
							<td>{product.title}</td>
							<td>{product.category.name}</td>
							<td>{product.price}</td>
							<td>{product.stock}</td>
							<td>
								<button type="button" className="btn-filter" onClick={() => handleDeleteProduct(product.id)}>
									Delete
								</button>
							</td>
						</tr>
                    ))}
				</tbody>
			</table>
		</main>
	);
};

export default AdminPage;
