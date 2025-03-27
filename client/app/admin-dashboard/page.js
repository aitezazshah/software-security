"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, Cross, Users, Users2, Trash2 } from "lucide-react";
import { Mail } from "lucide-react";
import { Store } from "lucide-react";
import { Package } from "lucide-react";
import { Shield } from "lucide-react";
import { UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Input } from "@/components/ui/input";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPanel() {
  const [section, setSection] = useState("users");
  const [admins, setAdmins] = useState([]);

  const [users, setUsers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ email: "", password: "" });

  const router = useRouter();

  useEffect(() => {
    if (section !== "admins") loadData(section);
  }, [section]);

  const loadData = async (type) => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/${type}`,
        { withCredentials: true }
      );
      if (type === "users") setUsers(data);
      if (type === "sellers") setSellers(data);
      if (type === "products") setProducts(data);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const loadContacts = async () => {
    try {
      if (section === "contacts") {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/contacts`,
          {
            withCredentials: true,
          }
        );
        setContacts(data);
      } else if (section === "admins") {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/get-admin`,
          {
            withCredentials: true,
          }
        );
        console.log("Admins data:", data); // Log the data to see the response
        setAdmins(data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  useEffect(() => {
    if (section === "contacts" || section === "admins") {
      loadContacts();
    }
  }, [section]);

  const createAdmin = async () => {
    if (!newAdmin.email || !newAdmin.password || !newAdmin.fullName) return;
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/create-admin`,
        newAdmin,
        {
          withCredentials: true,
        }
      );
      setNewAdmin({ fullName: "", email: "", password: "" });
      toast.success("Admin created successfully");
      loadContacts();
    } catch (error) {
      console.error("Error creating admin:", error);
      toast.error("Failed to create admin");
    }
  };

  const deleteAdmin = async (id) => {
    try {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/delete-admins/${id}`,
        {
          withCredentials: true,
        }
      );
      loadContacts();
      toast.success("Admin deleted successfully");
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to delete admin";
      toast.error(errorMessage);
    }
  };

  // Admin data management
  const loadAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users`,
        { withCredentials: true }
      );
      setAllUsers(data.filter((user) => user.role !== "admin"));
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const toggleUserStatus = async (userId, disabled) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`,
        { disabled },
        { withCredentials: true }
      );
      loadData("users");
      toast.success("User status updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  const approveSeller = async (sellerId) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/sellers/${sellerId}/approve`,
        {},
        { withCredentials: true }
      );
      loadData("sellers");
      toast.success("Seller approved successfully");
    } catch (error) {
      console.error("Error approving seller:", error);
      toast.error("Failed to approve seller");
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/products/${productId}`,
        { withCredentials: true }
      );
      loadData("products");
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleLogout = async () => {
    await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/admin/admin-logout`,
      {},
      { withCredentials: true }
    );
    toast.success("Logout successful");
    router.push("/admin-login");
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>
          <Button onClick={handleLogout} variant="destructive" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container py-8 px-4">
        <Tabs value={section} onValueChange={setSection} className="mb-8">
          <TabsList>
            <TabsTrigger value="users" className="flex gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="sellers" className="flex gap-2">
              <Store className="h-4 w-4" />
              Sellers
            </TabsTrigger>
            <TabsTrigger value="products" className="flex gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex gap-2">
              <Mail className="h-4 w-4" /> Contacts
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex gap-2">
              <Shield className="h-4 w-4" />
              Admins
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle className="capitalize">
              {section === "admins" ? "Manage Admins" : `Manage ${section}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Users management */}
            {section === "users" && (
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            className={
                              user.isDisabled
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-600 hover:bg-red-700"
                            }
                            onClick={() =>
                              toggleUserStatus(user._id, !user.isDisabled)
                            }
                          >
                            {user.isDisabled ? "Enable" : "Disable"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}

            {section === "contacts" && (
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact._id}>
                        <TableCell>{contact.fullName}</TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>{contact.phone}</TableCell>
                        <TableCell>{contact.message}</TableCell>
                        <TableCell>
                          {new Date(contact.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}

            {section === "admins" && (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Admin Name"
                    type="text"
                    value={newAdmin.fullName}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, fullName: e.target.value })
                    }
                  />

                  <Input
                    placeholder="Admin Email"
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, email: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Password"
                    type="password"
                    value={newAdmin.password}
                    onChange={(e) =>
                      setNewAdmin({ ...newAdmin, password: e.target.value })
                    }
                  />
                  <Button onClick={createAdmin} variant="default">
                    <UserPlus className="mr-2 h-4 w-4" /> Add Admin
                  </Button>
                </div>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admins.map((admin) => (
                        <TableRow key={admin._id}>
                          <TableCell className="font-medium">
                            {admin.fullName}
                          </TableCell>
                          <TableCell>{admin.email}</TableCell>
                          <TableCell>{admin.role}</TableCell>
                          <TableCell className="text-right">
                            {admin.role === "admin" ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteAdmin(admin._id)}
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </Button>
                            ) : (
                              ""
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            )}

            {/* Sellers approval */}
            {section === "sellers" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellers.map((seller) => (
                    <TableRow key={seller._id}>
                      <TableCell>{seller.fullName}</TableCell>
                      <TableCell>{seller.email}</TableCell>
                      <TableCell>
                        {seller.approved ? "Approved" : "Pending"}
                      </TableCell>
                      <TableCell className="text-right">
                        {!seller.approved && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => approveSeller(seller._id)}
                          >
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Products management */}
            {section === "products" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>${product.price}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteProduct(product._id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
