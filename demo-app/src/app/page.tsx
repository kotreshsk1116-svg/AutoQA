"use client";

import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";

export default function Home() {
  const { addToCart } = useCart();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
      {products.map((product) => (
        <div key={product.id} className="bg-white p-4 rounded shadow hover:shadow-lg transition-shadow">
          <div className="h-48 bg-gray-200 rounded mb-4 flex items-center justify-center">
            {/* Using a placeholder for image */}
            <span className="text-gray-500">Image: {product.name}</span>
          </div>
          <h2 className="text-lg font-semibold">{product.name}</h2>
          <div className="flex items-center mt-2 space-x-2">
            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded font-bold">{product.rating} ★</span>
          </div>
          <p className="text-gray-600 mt-2 text-sm">{product.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xl font-bold">${product.price}</span>
            <button
              onClick={() => addToCart(product)}
              className="bg-flipkartYellow text-black px-4 py-2 rounded font-semibold shadow hover:bg-yellow-500 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
