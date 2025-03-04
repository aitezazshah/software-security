"use client";

export default function ProductList({ products }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product?._id} className="border p-4 rounded-lg shadow-sm">
          <img
            src={product?.image}
            alt={product?.name}
            className="w-full h-48 object-cover mb-4 rounded"
          />
          <h3 className="text-xl font-semibold mb-2">{product?.name}</h3>
          <p className="text-gray-600 mb-2">{product?.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">${product?.price}</span>
            <span className="text-gray-500">Qty: {product?.quantity}</span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Seller: {product?.seller?.fullName || "Unknown Seller"}
          </div>
        </div>
      ))}
    </div>
  );
}
