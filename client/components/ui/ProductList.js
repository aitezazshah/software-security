"use client";

import Product from "./Product";

export default function ProductList({ products, user, onDelete, onPurchase }) {
  // Filter products for sellers to show only their own products
  const filteredProducts =
    user?.role === "seller"
      ? products.filter((product) => product.seller?._id === user?._id)
      : products; // Buyers see all products

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {filteredProducts.map((product) => (
        <Product
          key={product._id}
          product={product}
          user={user}
          onDelete={onDelete}
          onPurchase={onPurchase}
        />
      ))}
    </div>
  );
}
