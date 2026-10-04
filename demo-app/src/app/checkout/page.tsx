"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  if (cart.length === 0 && !success) {
    return (
      <div className="bg-white p-8 rounded shadow text-center mt-4">
        <h2 className="text-2xl font-bold mb-4">No items to checkout</h2>
        <Link href="/" className="text-flipkartBlue font-medium hover:underline">
          Go back to shopping
        </Link>
      </div>
    );
  }

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    clearCart();
    setSuccess(true);
    setTimeout(() => {
      router.push("/");
    }, 3000);
  };

  if (success) {
    return (
      <div className="bg-white p-8 rounded shadow text-center mt-4 border-t-4 border-green-500">
        <h2 className="text-3xl font-bold text-green-600 mb-4">Order Placed Successfully!</h2>
        <p className="text-gray-600">Redirecting to home page...</p>
      </div>
    );
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="max-w-2xl mx-auto mt-4">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-6">Checkout</h2>
        <form onSubmit={handleCheckout} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Full Name</label>
            <input required type="text" className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-flipkartBlue" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Address</label>
            <textarea required className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-flipkartBlue" placeholder="123 Main St, City" rows={3}></textarea>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Card Number</label>
            <input required type="text" className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-flipkartBlue" placeholder="XXXX XXXX XXXX XXXX" />
          </div>
          <div className="border-t pt-4 mt-6">
            <div className="flex justify-between font-bold text-lg mb-4">
              <span>Total to Pay:</span>
              {/* BUG INTRODUCED: Checkout total miscalculated by subtracting 10 */}
              <span>${Math.max(0, total - 10)}</span>
            </div>
            {/* CHANGED ID AND TEXT for self-healing demo */}
            <button id="btn-confirm-order-v2" type="submit" className="w-full bg-yellow-500 text-white font-bold py-3 rounded shadow hover:bg-yellow-600 transition-colors">
              Place Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
