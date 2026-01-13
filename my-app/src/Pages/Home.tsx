import { useEffect, useMemo, useState } from "react";
import Header from "../components/ui/layout/Header";
import Footer from "../components/ui/layout/Footer";
import FiltersSidebar from "../components/ui/filters/FiltersSidebar";
import ProductGrid from "../components/ui/products/ProductGrid";
import AuthModal from "../components/ui/modals/AuthModal";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  brand: string;
  category: string;
}

type PriceRange =
  | "all"
  | "0-20000"
  | "20000-50000"
  | "50000-100000"
  | "100000+";

// Helper functions for URL state management
const getFilterStateFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    searchTerm: params.get("search") || "",
    selectedCategories: params.get("categories")
      ? params.get("categories")!.split(",").filter(Boolean)
      : [],
    selectedBrands: params.get("brands")
      ? params.get("brands")!.split(",").filter(Boolean)
      : [],
    priceRange: (params.get("price") || "all") as PriceRange,
  };
};

const updateURLWithFilterState = (
  searchTerm: string,
  selectedCategories: string[],
  selectedBrands: string[],
  priceRange: PriceRange
) => {
  const params = new URLSearchParams();
  if (searchTerm) params.set("search", searchTerm);
  if (selectedCategories.length > 0) params.set("categories", selectedCategories.join(","));
  if (selectedBrands.length > 0) params.set("brands", selectedBrands.join(","));
  if (priceRange !== "all") params.set("price", priceRange);

  const newURL = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;

  window.history.replaceState(null, "", newURL);
};

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const initialFilterState = getFilterStateFromURL();
  const [searchTerm, setSearchTerm] = useState(initialFilterState.searchTerm);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialFilterState.selectedCategories
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    initialFilterState.selectedBrands
  );
  const [priceRange, setPriceRange] = useState<PriceRange>(
    initialFilterState.priceRange
  );

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  // Load products
  useEffect(() => {
    fetch("/mock.json")
      .then((res) => res.json())
      .then((data: Product[]) => setProducts(data))
      .catch(console.error);
  }, []);

  // Update URL when filters change
  useEffect(() => {
    updateURLWithFilterState(searchTerm, selectedCategories, selectedBrands, priceRange);
  }, [searchTerm, selectedCategories, selectedBrands, priceRange]);

  // Extract unique categories and brands
  const categories = useMemo(() => {
    return [...new Set(products.map((p) => p.category))];
  }, [products]);

  const brands = useMemo(() => {
    return [...new Set(products.map((p) => p.brand))];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(p.category);

      const matchBrand =
        selectedBrands.length === 0 ||
        selectedBrands.includes(p.brand);

      const matchPrice =
        priceRange === "all" ||
        (priceRange === "0-20000" && p.price <= 20000) ||
        (priceRange === "20000-50000" &&
          p.price > 20000 &&
          p.price <= 50000) ||
        (priceRange === "50000-100000" &&
          p.price > 50000 &&
          p.price <= 100000) ||
        (priceRange === "100000+" && p.price > 100000);

      return matchSearch && matchCategory && matchBrand && matchPrice;
    });
  }, [products, searchTerm, selectedCategories, selectedBrands, priceRange]);

  return (
    <>
      <Header
        onLoginClick={() => {
          setShowLogin(true);
          setShowSignup(false);
        }}
        onSignupClick={() => {
          setShowSignup(true);
          setShowLogin(false);
        }}
      />

      {/* 🔐 AUTH MODAL (CONNECTED) */}
      
      <AuthModal
        showLogin={showLogin}
        showSignup={showSignup}
        onClose={() => {
          setShowLogin(false);
          setShowSignup(false);
        }}
      />

      <main className="bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-2 pl-52 ">
          <label htmlFor="product-search" className="sr-only">
            Search products
          </label>
          <input
            id="product-search"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="w-full max-w-xl rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row gap-6 pl-39">
          <FiltersSidebar
            categories={categories}
            selectedCategories={selectedCategories}
            onToggleCategory={(category) =>
              setSelectedCategories((prev) =>
                prev.includes(category)
                  ? prev.filter((c) => c !== category)
                  : [...prev, category]
              )
            }
            brands={brands}
            selectedBrands={selectedBrands}
            onToggleBrand={(brand) =>
              setSelectedBrands((prev) =>
                prev.includes(brand)
                  ? prev.filter((b) => b !== brand)
                  : [...prev, brand]
              )
            }
            priceRange={priceRange}
            onPriceChange={(value) =>
              setPriceRange(value as PriceRange)
            }
            onClear={() => {
              setSearchTerm("");
              setSelectedCategories([]);
              setSelectedBrands([]);
              setPriceRange("all");
            }}
          />

          <ProductGrid
            products={filteredProducts}
            selectedCard={selectedCard}
            onSelect={setSelectedCard}
          />
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Home;
