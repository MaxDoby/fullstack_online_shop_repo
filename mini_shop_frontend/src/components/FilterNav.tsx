import Button from './Button';

interface FilterNavProps {
    categories: string[];
    filterProducts: (cat:string) => void;
}

const FilterNav = ({ categories, filterProducts }:FilterNavProps) => (
	<nav className="filter-nav">
		{categories.map((cat) => (
			<Button key={cat} className="btn-filter" onClick={() => filterProducts(cat)}
                >
				{cat}
			</Button>
            ))}
	</nav>
);

export default FilterNav;
