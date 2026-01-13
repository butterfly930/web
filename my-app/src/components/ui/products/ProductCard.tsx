interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  brand: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
  isSelected: boolean;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isSelected,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg p-4 sm:p-6 md:p-8 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "shadow-lg shadow-gray-600" : "shadow-sm"
      }`}
    >
      <img
        src={product.image}
        alt={product.name}
        className="h-32 sm:h-40 md:h-48 w-full object-cover mb-3 rounded"
      />
      <h3 className="font-semibold text-base sm:text-lg mb-2">{product.name}</h3>
      <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
      <p className="mt-4 sm:mt-6 text-red-600">
  <span className="font-light text-xl">
    {product.price.toLocaleString()}
  </span>{" "}
  <span className="font-medium text-xl">
    Lekë
  </span>
</p>

      <button className="mt-3 sm:mt-4 px-3 sm:px-4 py-2 bg-blue-600 text-black rounded hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto">
        Shiko më shumë
      </button>
    </div>
  );
};

export default ProductCard;
