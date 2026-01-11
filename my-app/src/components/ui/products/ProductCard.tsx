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
      className={`border rounded p-4 cursor-pointer ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
    >
      <img
        src={product.image}
        alt={product.name}
        className="h-40 w-full object-cover mb-2"
      />
      <h3 className="font-semibold">{product.name}</h3>
      <p className="text-sm text-gray-600">{product.description}</p>
      <p className="font-bold mt-2">
        {product.price.toLocaleString()} Lek
      </p>
    </div>
  );
};

export default ProductCard;
