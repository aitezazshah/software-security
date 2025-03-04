"use client";
import { toast } from "sonner";
import axios from "axios";
import { Button } from "@/components/ui/button";

export default function Product({ product, user, onDelete, onPurchase }) {
  const handleDelete = async () => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${product._id}`,
        {
          withCredentials: true,
        }
      );
      onDelete(product._id);
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const handlePurchase = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${product._id}/purchase`,
        {},
        { withCredentials: true }
      );
      onPurchase(response.data.updatedProduct);
      toast.success("Purchase successful!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Purchase failed");
    }
  };

  return (
    <div className="border p-4 rounded-lg shadow-sm relative">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover mb-4 rounded"
      />

      <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
      <p className="text-gray-600 mb-2">{product.description}</p>

      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-bold">${product.price}</span>
        <span className="text-gray-500">Qty: {product.quantity}</span>
      </div>

      {/* <div className="mt-2 text-sm text-gray-500">
        Sold by: {product.seller?.fullName || "Unknown Seller"}
      </div> */}

      <div className="mt-4 flex gap-2">
        {user?.role === "seller" && product.seller?._id === user?._id && (
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        )}

        {user?.role === "buyer" && (
          <Button
            onClick={handlePurchase}
            disabled={product.quantity < 1}
            className={`px-4 py-2 rounded ${
              product.quantity < 1
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {product.quantity < 1 ? "Out of Stock" : "Buy Now"}
          </Button>
        )}
      </div>
    </div>
  );
}
