interface SearchContProps {
	searchQuery: string;
	setSearchQuery: (value: string) => void;
	setCurrentPage: (page: number) => void;
}

const SearchCont = ({ searchQuery, setSearchQuery, setCurrentPage }: SearchContProps) => (
	<div className="search-container">
		<input
			type="text"
			className="search-input"
			placeholder="Cauta in catalog..."
			value={searchQuery}
			onChange={(e) => {
				setSearchQuery(e.target.value);
				setCurrentPage(1);
			}}
		/>
	</div>
);

export default SearchCont;
