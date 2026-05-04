const calculatePagination = (
	totalProducts: number,
	productsOnPage: number,
) => {
	const totalPages = Math.ceil(totalProducts / productsOnPage);
	return { totalPages };
};

export default calculatePagination;
