"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AuthForm({ type }) {
  const [role, setRole] = useState("buyer");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const isValidPassword = (password) => {
    return (
      password.length >= 8 && /\d/.test(password) && /[A-Z]/.test(password)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password || (type === "signup" && !fullName)) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (type === "signup" && !isValidPassword(password)) {
      setError(
        "Password must be at least 8 characters long, include a number and an uppercase letter"
      );
      setLoading(false);
      return;
    }

    const userData = {
      email,
      password,
      ...(type === "signup" && { fullName }),
      role,
    };

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/${type}`,
        userData,
        { withCredentials: true }
      );
      if (type === "login") {
        const user = response?.data?.user; // Assuming API returns user object
        console.log("Full Response:", response);
        console.log("User Object:", user);
        if (user.role !== role) {
          setError(`Invalid role selection`);
          return;
        }
      }

      if (response.status === 201 || response.status === 200) {
        router.push("/dashboard");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Authentication failed");
      if (
        error.response?.data?.message
          ?.toLowerCase()
          .includes("user already exists")
      ) {
        setError("User already exists. Please log in instead.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-96 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {type === "login" ? "Login" : "Sign Up"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-center mb-2">{error}</p>}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {type === "signup" && (
              <Input
                type="text"
                placeholder="Full Name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            )}
            <Input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1.5 text-xl"
              >
                {showPassword ? "🐵" : "🙈"}
              </button>
            </div>

            <div className="flex justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="role"
                  value="buyer"
                  checked={role === "buyer"}
                  onChange={() => setRole("buyer")}
                />
                <span>Buyer</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="role"
                  value="seller"
                  checked={role === "seller"}
                  onChange={() => setRole("seller")}
                />
                <span>Seller</span>
              </label>
            </div>
            <div className="flex justify-end">
              <p className="text-sm text-gray-500">
                {type === "login"
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <a
                  href={type === "login" ? "/signup" : "/login"}
                  className="text-blue-500 hover:underline"
                >
                  {type === "login" ? "Sign Up" : "Login"}
                </a>
              </p>
            </div>

            <Button className="w-full" type="submit" disabled={loading}>
              {loading
                ? "Processing..."
                : type === "login"
                ? "Login"
                : "Sign Up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
