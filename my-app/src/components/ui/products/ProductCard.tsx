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
      className={`bg-white rounded p-9 cursor-pointer transition-shadow ${
        isSelected ? " shadow-lg shadow-gray-600 rounded" : ""
      }`}
    >
      <img
        src={product.image}
        alt={product.name}
        className="h-40 w-full object-cover mb-2"
      />
      <h3 className="font-semibold">{product.name}</h3>
      <p className="text-sm text-gray-600">{product.description}</p>
      <p className="mt-7 text-red-600">
  <span className="font-light text-xl">
    {product.price.toLocaleString()}
  </span>{" "}
  <span className="font-bold">
    Lekë
  </span>
</p>

      <button className="mt-2 px-4 py-2 shadow-red-200">Shiko më shumë</button>
    </div>
  );
};

export default ProductCard;
