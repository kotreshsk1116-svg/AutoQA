"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export function Navbar() {
  const { cart } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-flipkartBlue text-white p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold italic">
          Flipkart<span className="text-flipkartYellow">Clone</span>
        </Link>
        <div className="flex gap-6">
          <Link href="/cart" className="flex items-center gap-2 font-medium">
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="bg-flipkartYellow text-black px-2 py-0.5 rounded-full text-xs font-bold">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
