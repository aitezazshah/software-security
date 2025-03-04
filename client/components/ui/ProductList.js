"use client";

import Product from "./Product";

export default function ProductList({ products, user, onDelete, onPurchase }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map((product) => (
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
