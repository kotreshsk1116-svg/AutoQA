"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart } = useCart();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="bg-white p-8 rounded shadow text-center mt-4">
        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
        <Link href="/" className="text-flipkartBlue font-medium hover:underline">
          Go back to shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 mt-4">
      <div className="md:w-2/3">
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-xl font-bold border-b pb-4 mb-4">Shopping Cart</h2>
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center border-b py-4 last:border-0">
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                   <span className="text-xs text-gray-500">Img</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-gray-500">Qty: {item.quantity}</p>
                  <p className="font-bold mt-2">${item.price}</p>
                </div>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 font-medium hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="md:w-1/3">
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-xl font-bold border-b pb-4 mb-4">Price Details</h2>
          <div className="flex justify-between mb-4">
            <span>Price ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
            <span>${total}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span>Delivery Charges</span>
            <span className="text-green-600">Free</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-4 mb-6">
            <span>Total Amount</span>
            <span>${total}</span>
          </div>
          <Link href="/checkout" className="block text-center bg-orange-500 text-white font-bold py-3 rounded shadow hover:bg-orange-600 transition-colors">
            PLACE ORDER
          </Link>
        </div>
      </div>
    </div>
  );
}
