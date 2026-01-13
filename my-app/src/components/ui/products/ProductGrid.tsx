interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  brand: string;
  category: string;
}

interface ProductGridProps {
  products: Product[];
  selectedCard: number | null;
  onSelect: (id: number | null) => void;
}

import ProductCard from "./ProductCard";
import { useEffect, useRef } from "react";

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  selectedCard,
  onSelect,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        gridRef.current &&
        !gridRef.current.contains(event.target as Node)
      ) {
        onSelect(null);
      }
    };
 document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onSelect]);

  if (!products.length) {
    return <p>Nuk u gjet asnjë produkt.</p>;
  }

  return (
    <div 
    ref={gridRef}
    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 flex-1">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isSelected={selectedCard === product.id}
          onClick={() =>
            onSelect(selectedCard === product.id ? null : product.id)
          }
        />
      ))}
    </div>
  );
};

export default ProductGrid;
