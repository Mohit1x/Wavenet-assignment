import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/authContext";
import axios from "axios";
import CreateUserDialog from "@/components/user-management-helper/CreateUserDialog";
import UserFilters from "@/components/user-management-helper/UserFilters";
import UserTable from "@/components/user-management-helper/UserTable";
import EditUserDialog from "@/components/user-management-helper/EditUserDialog";
import { toast } from "sonner";

export interface User {
  _id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  group?: string;
  createdAt: string;
  createdBy?: { name: string; userId: string };
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const { user: currentUser } = useAuth();

  // Form data for create/edit dialogs
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    group: "",
  });

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (roleFilter && roleFilter !== "ALL") params.append("role", roleFilter);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response = await axios.get(
        `http://localhost:5000/api/users?${params}`,
        { withCredentials: true }
      );
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/users/create", formData, {
        withCredentials: true,
      });
      setCreateDialogOpen(false);
      setFormData({ name: "", email: "", password: "", role: "", group: "" });
      fetchUsers();

      toast.success("user created");
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await axios.put(
        `http://localhost:5000/api/users/${selectedUser._id}`,
        { role: formData.role },
        { withCredentials: true }
      );
      setEditDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();

      toast.success("user updated");
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        withCredentials: true,
      });
      fetchUsers();

      toast.success("user deleted");
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({ ...formData, role: user.role });
    setEditDialogOpen(true);
  };

  const getAvailableRoles = () => {
    switch (currentUser?.role) {
      case "SUPER_ADMIN":
        return ["ADMIN"];
      case "ADMIN":
        return ["UNIT_MANAGER"];
      case "UNIT_MANAGER":
        return ["USER"];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Create and manage users in your system
          </p>
        </div>
        <CreateUserDialog
          open={createDialogOpen}
          setOpen={setCreateDialogOpen}
          formData={formData}
          setFormData={setFormData}
          onCreate={handleCreateUser}
          getAvailableRoles={getAvailableRoles}
        />
      </div>

      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
      />

      <UserTable
        users={users}
        loading={loading}
        onEdit={openEditDialog}
        onDelete={handleDeleteUser}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />

      <EditUserDialog
        open={editDialogOpen}
        setOpen={setEditDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onUpdate={handleUpdateUser}
        selectedUser={selectedUser}
        getAvailableRoles={getAvailableRoles}
      />
    </div>
  );
}
