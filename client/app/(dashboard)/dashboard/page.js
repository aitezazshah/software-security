"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

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

  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <nav className="flex justify-between p-2 border-b border-gray-200">
        <span className="text-2xl font-bold text-gray-800">
          {user ? `Welcome, ${user.fullName}` : "Software Security"}
        </span>
        <Button onClick={handleLogout}>Logout</Button>
      </nav>
      <div>Dashboard</div>
    </div>
  );
}
