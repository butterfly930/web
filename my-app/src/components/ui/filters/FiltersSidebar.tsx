interface FiltersSidebarProps {
  categories: string[];
  brands: string[];
  selectedCategories: string[];
  selectedBrands: string[];
  priceRange: string;
  onToggleCategory: (value: string) => void;
  onToggleBrand: (value: string) => void;
  onPriceChange: (value: string) => void;
  onClear: () => void;
}

const priceOptions = [
  { value: "all", label: "Të gjitha" },
  { value: "0-20,000", label: "0 – 20,000 Lekë" },
  { value: "20,000-50,000", label: "20,000 – 50,000 Lekë" },
  { value: "50,000-100,000", label: "50,000 – 100,000 Lekë" },
  { value: "100,000+", label: "100,000+ Lekë" },
];

const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  categories,
  brands,
  selectedCategories,
  selectedBrands,
  priceRange,
  onToggleCategory,
  onToggleBrand,
  onPriceChange,
  onClear,
}) => {
  return (
    <aside className="w-full md:w-64 p-6  pl-2 box-border text-left">
      <h4 className="font-semibold mb-4">Filtrat</h4>
      <div className="mb-4">
        <h5 className="font-medium mb-2">Kategoria</h5>
        {categories.map((c) => (
          <label key={c} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selectedCategories.includes(c)}
              onChange={() => onToggleCategory(c)}
            />
            {c}
          </label>
        ))}
      </div>

      <div className="mb-4">
        <h5 className="font-medium mb-2">Brandet</h5>
        {brands.map((b) => (
          <label key={b} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selectedBrands.includes(b)}
              onChange={() => onToggleBrand(b)}
            />
            {b}
          </label>
        ))}
      </div>

      <div className="mb-4">
        <h5 className="font-medium mb-2">Çmimi</h5>
        {priceOptions.map((p) => (
          <label key={p.value} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={priceRange === p.value}
              onChange={() => onPriceChange(p.value)}
            />
            {p.label}
          </label>
        ))}
      </div>

      <button
        onClick={onClear}
        className="w-full bg-gray-200 py-2 rounded hover:bg-gray-600"
      >
        Pastro Filtrat
      </button>
    </aside>
  );
};

export default FiltersSidebar;
