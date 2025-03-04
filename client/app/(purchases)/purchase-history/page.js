"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PurchaseHistoryPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/purchases/history`,
          { withCredentials: true }
        );
        setPurchases(response.data);
      } catch (error) {
        toast.error("Failed to load purchase history");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Purchase History</h1>

      {purchases.length === 0 ? (
        <div className="text-center text-gray-500">No purchases found</div>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <div key={purchase._id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-4">
                {purchase.product?.image && (
                  <img
                    src={purchase.product.image}
                    alt={purchase.product.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{purchase.product?.name}</h3>
                  <p className="text-gray-600">
                    ${purchase.totalPrice} x {purchase.quantity}
                  </p>
                  <p className="text-sm text-gray-500">
                    Purchased on:{" "}
                    {new Date(purchase.purchaseDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button onClick={() => router.push("/dashboard")} className="mt-6">
        Back to Dashboard
      </Button>
    </div>
  );
}
