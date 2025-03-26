"use client";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ProductForm({ onSuccess }) {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [productImage, setProductImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);

    try {
      setIsLoading(true);
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/image/upload`,
        formData
      );
      setProductImage(response.data.secure_url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Image upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!productName || !productPrice || !productQuantity) {
      toast.error("Please fill all required fields");
      return;
    }

    // Convert values and validate
    const price = parseFloat(productPrice);
    const quantity = parseInt(productQuantity);

    if (price < 1) {
      toast.error("Price must be at least 1");
      return;
    }

    if (quantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/products/create`,
        {
          name: productName,
          description: productDescription,
          price,
          quantity,
          image: productImage,
        },
        { withCredentials: true }
      );

      toast.success("Product created successfully");
      setProductName("");
      setProductDescription("");
      setProductPrice("");
      setProductQuantity("");
      setProductImage("");
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Product Name"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
      />
      <Textarea
        placeholder="Description"
        value={productDescription}
        onChange={(e) => setProductDescription(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Price"
        value={productPrice}
        onChange={(e) => setProductPrice(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Quantity"
        value={productQuantity}
        onChange={(e) => setProductQuantity(e.target.value)}
      />
      <Input type="file" onChange={handleImageUpload} disabled={isLoading} />
      {productImage && (
        <img
          src={productImage}
          alt="Preview"
          className="h-32 w-32 object-cover rounded-md"
        />
      )}
      <Button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Product"}
      </Button>
    </div>
  );
}
