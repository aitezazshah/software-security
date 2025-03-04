"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import ProductList from "@/components/ui/ProductList";
import ProductForm from "@/components/ui/productForm";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Contact Us Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState([]);

  // Validation Errors
  const [errors, setErrors] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          { withCredentials: true }
        );
        setUser(response.data.user);
      } catch (error) {
        console.error("Failed to fetch user", error);
        router.push("/login");
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user
        const userResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
          { withCredentials: true }
        );
        setUser(userResponse.data.user);

        // Fetch products
        const productsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/products`
        );
        setProducts(productsResponse.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
        // router.push("/login");
      }
    };

    fetchData();
  }, [router]);

  const handleDelete = (deletedId) => {
    setProducts(products.filter((p) => p._id !== deletedId));
  };

  const handlePurchase = (updatedProduct) => {
    setProducts(
      products.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
      toast.success("Logged Out", {
        description: "You have been successfully logged out.",
      });
      router.push("/login");
    } catch (error) {
      toast.error("Logout Failed", {
        description: "An error occurred while logging out.",
      });
      console.error("Logout failed", error);
    }
  };

  const handleChangePassword = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`,
        { currentPassword, newPassword },
        { withCredentials: true }
      );
      toast.success("Password Changed", {
        description: "Your password has been updated.",
      });
      setCurrentPassword("");
      setNewPassword("");
      handleLogout();
      router.push("/login");
    } catch (error) {
      toast.error("Password Change Failed", {
        description: error.response?.data?.message || "Error occurred.",
      });
    }
  };

  const handleProductCreated = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/products`
      );
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to refresh products", error);
    }
  };

  const validateForm = () => {
    let newErrors = {};

    if (!fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!phone.trim()) {
      newErrors.phone = "Phone Number is required";
    } else if (!/^\+?\d{10,15}$/.test(phone)) {
      newErrors.phone = "Invalid phone number";
    }
    if (!message.trim()) newErrors.message = "Message cannot be empty";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitContact = async () => {
    if (!validateForm()) return;

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/contact`, {
        fullName,
        email,
        phone,
        message,
      });
      toast.success("Message Sent", {
        description: "We will get back to you soon!",
      });

      // Clear form fields
      setFullName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setErrors({});
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Submission Failed", {
        description: "An error occurred while sending your message.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <nav className="flex justify-between p-2 border-b border-gray-200">
        <span className="text-2xl font-bold text-gray-800">
          {user ? `Welcome, ${user.fullName}` : "Software Security"}
        </span>
        <div className="flex gap-2">
          {user?.role === "seller" && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create Product</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Product</DialogTitle>
                </DialogHeader>
                <ProductForm onSuccess={handleProductCreated} />
              </DialogContent>
            </Dialog>
          )}
          {/* Contact Us Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>Contact Us</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Contact Us</DialogTitle>
              </DialogHeader>

              <Input
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              {errors.fullName && (
                <span className="text-red-500 text-sm">{errors.fullName}</span>
              )}

              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <span className="text-red-500 text-sm">{errors.email}</span>
              )}

              <Input
                type="number"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {errors.phone && (
                <span className="text-red-500 text-sm">{errors.phone}</span>
              )}

              <Textarea
                placeholder="Your Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              {errors.message && (
                <span className="text-red-500 text-sm">{errors.message}</span>
              )}

              <Button onClick={handleSubmitContact}>Send Message</Button>
            </DialogContent>
          </Dialog>

          {/* Change Password Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button>Change Password</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
              </DialogHeader>
              <Input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button onClick={handleChangePassword}>Update Password</Button>
            </DialogContent>
          </Dialog>

          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </nav>
      <div>
        {" "}
        <ProductList
          products={products}
          user={user}
          onDelete={handleDelete}
          onPurchase={handlePurchase}
        />
      </div>
    </div>
  );
}
