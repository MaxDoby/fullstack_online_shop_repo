const logicFilterProducts = (
	newCategory: string,
	setActiveCategory: (category: string) => void,
	setCurrentPage: (page: number) => void,
	setSearchQuery: (value: string) => void,
) => {
	setSearchQuery('');
	setActiveCategory(newCategory);
	setCurrentPage(1);
};

export default logicFilterProducts;
