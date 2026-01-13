import { useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Filter Header */}
      <div className="lg:hidden w-full mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full bg-white rounded-lg shadow-sm p-4 text-left"
        >
          <h4 className="font-semibold text-lg">Filtrat</h4>
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Filter Content */}
      <aside className={`${
        isOpen ? "block" : "hidden"
      } lg:block w-full lg:w-64 p-4 sm:p-6 box-border text-left`}>
        <h4 className="font-semibold text-lg mb-4 hidden lg:block">Filtrat</h4>
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
        onClick={() => {
          onClear();
          setIsOpen(false);
        }}
        className="w-full bg-gray-200 py-2 px-4 rounded hover:bg-gray-300 transition-colors text-sm sm:text-base"
      >
        Pastro Filtrat
      </button>
    </aside>
    </>
  );
};

export default FiltersSidebar;
