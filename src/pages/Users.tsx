"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/axios";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AccessControl from "@/components/AccessControl";
import { Permission, usePermissions } from "@/contexts/PermissionsContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useAuth, UserRole } from "@/contexts/AuthContext";

export interface User {
  _id?: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  role?: string;
  organizationRoles?: UserRole[];
  kpiCount?: number;
  priorityCount?: number;
  performance?: string;
  performanceValue?: number;
  avatar?: string;
}

export default function UsersPage() {
  const { toast } = useToast();
  const { currentOrganization } = useOrganization();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newUser, setNewUser] = useState<
    Omit<
      User,
      | "id"
      | "kpiCount"
      | "priorityCount"
      | "performance"
      | "performanceValue"
      | "avatar"
    >
  >({
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    role: "user", // Default role
    organizationRoles: currentOrganization
      ? [
          {
            organizationId: currentOrganization._id,
            role: "user",
          },
        ]
      : [],
  });

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/users");
      setUsers(response.data);
    } catch (error: any) {
      console.error("Error fetching users:", error);

      // Handle different error types
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const status = error.response.status;
        if (status === 401) {
          setError("Unauthorized: Please log in again");
        } else if (status === 403) {
          setError("Forbidden: You don't have permission to access users");
        } else if (status === 404) {
          setError("Users not found");
        } else if (status === 500) {
          setError("Internal server error: Please try again later");
        } else {
          setError(
            `Error: ${error.response.data.message || "Failed to fetch users"}`
          );
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError("Network error: Please check your connection");
      } else {
        // Something happened in setting up the request
        setError(`Error: ${error.message || "Failed to fetch users"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Update the newUser state when currentOrganization changes
  useEffect(() => {
    if (currentOrganization) {
      setNewUser((prev) => ({
        ...prev,
        organizationRoles: [
          {
            organizationId: currentOrganization._id,
            role: prev.role || "user",
          },
        ],
      }));
    }
  }, [currentOrganization]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!dialogOpen) {
      setNewUser({
        name: "",
        email: "",
        phone: "",
        department: "",
        designation: "",
        role: "user", // Default role
        organizationRoles: currentOrganization
          ? [
              {
                organizationId: currentOrganization._id,
                role: "user",
              },
            ]
          : [],
      });
    }
  }, [dialogOpen, editDialogOpen]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    // Basic phone validation - can be adjusted based on your requirements
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!newUser.name.trim()) {
      errors.name = "Name is required";
    }

    if (!newUser.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(newUser.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!newUser.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!validatePhone(newUser.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    if (!newUser.department.trim()) {
      errors.department = "Department is required";
    }

    if (!newUser.designation.trim()) {
      errors.designation = "Designation is required";
    }

    if (!newUser.role) {
      errors.role = "Role is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEditForm = () => {
    if (!userToEdit) return false;

    const errors: Record<string, string> = {};

    if (!userToEdit.name.trim()) {
      errors.name = "Name is required";
    }

    if (!userToEdit.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(userToEdit.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!userToEdit.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!validatePhone(userToEdit.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    if (!userToEdit.department.trim()) {
      errors.department = "Department is required";
    }

    if (!userToEdit.designation.trim()) {
      errors.designation = "Designation is required";
    }

    if (!userToEdit.role) {
      errors.role = "Role is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // const handleInputChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  // ) => {
  //   const { name, value } = e.target;

  //   if (name === "phone" && e.target instanceof HTMLInputElement) {
  //     // Only allow numbers and plus sign at the start
  //     const sanitizedValue = value.replace(/[^0-9+]/g, "");
  //     // Ensure plus sign is only at the start
  //     const formattedValue = sanitizedValue.replace(/\+/g, (match, offset) =>
  //       offset === 0 ? match : ""
  //     );
  //     setNewUser((prev) => ({
  //       ...prev,
  //       [name]: formattedValue,
  //     }));
  //   } else if (name === "role" && currentOrganization) {
  //     // Update both the legacy role field and the organization-specific role
  //     setNewUser((prev) => {
  //       // Create or update the organization role
  //       const updatedOrgRoles = prev.organizationRoles
  //         ? [...prev.organizationRoles]
  //         : [];
  //       const orgRoleIndex = updatedOrgRoles.findIndex(
  //         (r) => r.organizationId === currentOrganization._id
  //       );

  //       if (orgRoleIndex >= 0) {
  //         // Update existing role
  //         updatedOrgRoles[orgRoleIndex] = {
  //           ...updatedOrgRoles[orgRoleIndex],
  //           role: value,
  //         };
  //       } else {
  //         // Add new role
  //         updatedOrgRoles.push({
  //           organizationId: currentOrganization._id,
  //           role: value,
  //         });
  //       }

  //       return {
  //         ...prev,
  //         [name]: value,
  //         organizationRoles: updatedOrgRoles,
  //       };
  //     });
  //   } else {
  //     setNewUser((prev) => ({
  //       ...prev,
  //       [name]: value,
  //     }));
  //   }

  //   // Clear error for this field when user types
  //   if (formErrors[name]) {
  //     setFormErrors((prev) => ({
  //       ...prev,
  //       [name]: "",
  //     }));
  //   }
  // };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "name" || name === "department" || name === "designation") {
      const sanitizedValue = value.replace(/[^A-Za-z _-]/g, "").replace(/\s{2,}/g, " ");
      setNewUser((prev) => ({
        ...prev,
        [name]: sanitizedValue,
      }));
    } else if (name === "email") {
      // const sanitizedValue = value.replace(/[^A-Za-z0-9@.-]/g, "").replace(/\s+/g, "").replace(/\.{2,}/g, ".").replace(/^@+|@(?![^@]*$)/g, "");
      const sanitizedValue = sanitizeEmail(value);
      setNewUser((prev) => ({
        ...prev,
        [name]: sanitizedValue,
      }));
    } else if (name === "phone" && e.target instanceof HTMLInputElement) {
      const sanitizedValue = value.replace(/[^0-9+]/g, "");
      const formattedValue = sanitizedValue.replace(/\+/g, (match, offset) =>
        offset === 0 ? match : ""
      );
      setNewUser((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else if (name === "role" && currentOrganization) {
      setNewUser((prev) => {
        const updatedOrgRoles = prev.organizationRoles
          ? [...prev.organizationRoles]
          : [];
        const orgRoleIndex = updatedOrgRoles.findIndex(
          (r) => r.organizationId === currentOrganization._id
        );

        if (orgRoleIndex >= 0) {
          updatedOrgRoles[orgRoleIndex] = {
            ...updatedOrgRoles[orgRoleIndex],
            role: value,
          };
        } else {
          updatedOrgRoles.push({
            organizationId: currentOrganization._id,
            role: value,
          });
        }

        return {
          ...prev,
          [name]: value,
          organizationRoles: updatedOrgRoles,
        };
      });
    } else {
      setNewUser((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  function sanitizeEmail(value: string): string {
    let sanitized = value
      .replace(/[^A-Za-z0-9@.\-]/g, "")             // Remove invalid characters
      .replace(/\s+/g, "")                          // Remove spaces
      .replace(/^@+|@(?![^@]*$)/g, "")              // Allow only one @
      .replace(/\.{2,}/g, ".")                      // Replace consecutive dots
      .replace(/(\.-)|(-\.)/g, match => match.replace("-", "")); // Disallow .- and -.

    // ✅ Only 1 hyphen allowed
    const hyphenMatches = sanitized.match(/-/g);
    if (hyphenMatches && hyphenMatches.length > 1) {
      let seen = 0;
      sanitized = sanitized.replace(/-/g, () => ++seen === 1 ? "-" : "");
    }

    // ✅ Only 2 dots allowed
    const dotMatches = sanitized.match(/\./g);
    if (dotMatches && dotMatches.length > 2) {
      let seen = 0;
      sanitized = sanitized.replace(/\./g, () => ++seen <= 2 ? "." : "");
    }

    return sanitized;
  }


  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!userToEdit || !currentOrganization) return;
    const { name, value } = e.target;
    if (name === "name" || name === "department" || name === "designation") {
      const sanitizedValue = value.replace(/[^A-Za-z _-]/g, "").replace(/\s{2,}/g, " ");
      setUserToEdit((prev) => ({
        ...prev,
        [name]: sanitizedValue,
      }));
    } else if (name === "email") {
      // const sanitizedValue = value.replace(/[^A-Za-z0-9@.]/g, "").replace(/\s+/g, "").replace(/\.{2,}/g, ".").replace(/^@+|@(?![^@]*$)/g, "");
      const sanitizedValue = sanitizeEmail(value);
      setUserToEdit((prev) => ({
        ...prev,
        [name]: sanitizedValue,
      }));
    } else if (name === "role") {
      // Update both the legacy role field and the organization-specific role
      setUserToEdit((prev) => {
        if (!prev) return prev;

        // Create or update the organization role
        const updatedOrgRoles = prev.organizationRoles
          ? [...prev.organizationRoles]
          : [];
        const orgRoleIndex = updatedOrgRoles.findIndex(
          (r) => r.organizationId === currentOrganization._id
        );

        if (orgRoleIndex >= 0) {
          // Update existing role
          updatedOrgRoles[orgRoleIndex] = {
            ...updatedOrgRoles[orgRoleIndex],
            role: value,
          };
        } else {
          // Add new role
          updatedOrgRoles.push({
            organizationId: currentOrganization._id,
            role: value,
          });
        }

        return {
          ...prev,
          [name]: value,
          organizationRoles: updatedOrgRoles,
        };
      });
    } else {
      setUserToEdit((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [name]: value,
        };
      });
    }

    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const openEditDialog = (user: User) => {
    setUserToEdit(user);
    setEditDialogOpen(true);
    setFormErrors({});
  };

  const handleAddUser = async () => {
    // Validate inputs
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const newUserWithDefaults: User = {
      ...newUser,
      id: `user-${Date.now()}`,
      kpiCount: 0,
      priorityCount: 0,
      performance: "Need Improvement",
      performanceValue: 50,
      avatar: "",
    };

    try {
      await axiosInstance.post("/users", newUserWithDefaults);

      // Reset form and close dialog
      setNewUser({
        name: "",
        email: "",
        phone: "",
        department: "",
        designation: "",
        role: "user", // Default role
        organizationRoles: currentOrganization
          ? [
              {
                organizationId: currentOrganization._id,
                role: "user",
              },
            ]
          : [],
      });
      setDialogOpen(false);
      setFormErrors({});

      toast({
        title: "User added",
        description: `${newUserWithDefaults.name} has been added successfully`,
      });

      // Refresh the user list
      fetchUsers();
      window.location.reload();
    } catch (error: any) {
      console.error("Error adding user:", error);

      // Handle different error types
      if (error.response) {
        const status = error.response.status;
        const errorMessage =
          error.response.data.message || "Failed to add user";

        if (status === 400) {
          // Bad request - likely validation errors
          if (error.response.data.message.includes("email")) {
            setFormErrors((prev) => ({
              ...prev,
              email: "Email already exists or is invalid",
            }));
          } else {
            toast({
              title: "Validation Error",
              description: errorMessage,
              variant: "destructive",
            });
          }
        } else if (status === 401) {
          toast({
            title: "Unauthorized",
            description: "Please log in again to add users",
            variant: "destructive",
          });
        } else if (status === 403) {
          toast({
            title: "Permission Denied",
            description: "You don't have permission to add users",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } else if (error.request) {
        toast({
          title: "Network Error",
          description: "Please check your connection and try again",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to add user",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!userToEdit) return;

    // Validate inputs
    if (!validateEditForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await axiosInstance.put(`/users/${userToEdit._id}`, userToEdit);

      // Close dialog
      setEditDialogOpen(false);
      setUserToEdit(null);
      setFormErrors({});

      toast({
        title: "User updated",
        description: `${userToEdit.name} has been updated successfully`,
      });

      // Refresh the user list
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating user:", error);

      // Handle different error types
      if (error.response) {
        const status = error.response.status;
        const errorMessage =
          error.response.data.message || "Failed to update user";

        if (status === 400) {
          // Bad request - likely validation errors
          if (error.response.data.message.includes("email")) {
            setFormErrors((prev) => ({
              ...prev,
              email: "Email already exists or is invalid",
            }));
          } else {
            toast({
              title: "Validation Error",
              description: errorMessage,
              variant: "destructive",
            });
          }
        } else if (status === 401) {
          toast({
            title: "Unauthorized",
            description: "Please log in again to update users",
            variant: "destructive",
          });
        } else if (status === 403) {
          toast({
            title: "Permission Denied",
            description: "You don't have permission to update users",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } else if (error.request) {
        toast({
          title: "Network Error",
          description: "Please check your connection and try again",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to update user",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
  }, []);
  return (
    <main className="min-h-screen bg-black text-white py-4 px-2">
      <div className="w-full mx-auto">
        <div className="flex justify-between items-center rounded-lg p-4 bg-[#222222]">
          <h1 className="text-2xl font-normal">Users</h1>
          <AccessControl requiredPermissions={[Permission.MANAGE_USERS]}>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <Button
                className="bg-white text-black hover:bg-gray-200"
                onClick={() => setDialogOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add User
              </Button>
              <DialogContent className="sm:max-w-[425px] bg-[#111111] text-white border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">
                    Add New User
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name {!newUser.name && <span className="text-red-500">*</span>}</Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      // pattern="[A-Za-z]+"
                      value={newUser.name}
                      onChange={handleInputChange}
                      className={`bg-[#222222] border-gray-700 ${
                        formErrors.name ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.name && (
                      <p className="text-xs text-red-500">{formErrors.name}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email {!newUser.email && <span className="text-red-500">*</span>}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newUser.email}
                      onChange={handleInputChange}
                      className={`bg-[#222222] border-gray-700 ${
                        formErrors.email ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.email && (
                      <p className="text-xs text-red-500">{formErrors.email}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number {!newUser.phone && <span className="text-red-500">*</span>}</Label>
                    <Input
                      maxLength={10}
                      minLength={10}
                      id="phone"
                      name="phone"
                      type="tel"
                      value={newUser.phone}
                      onChange={handleInputChange}
                      className={`bg-[#222222] border-gray-700 ${
                        formErrors.phone ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.phone && (
                      <p className="text-xs text-red-500">{formErrors.phone}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="department">Department {!newUser.department && <span className="text-red-500">*</span>}</Label>
                    <Input
                      id="department"
                      name="department"
                      value={newUser.department}
                      onChange={handleInputChange}
                      className={`bg-[#222222] border-gray-700 ${
                        formErrors.department ? "border-red-500" : ""
                      }`}
                      placeholder="e.g. Sales, Marketing, Engineering"
                    />
                    {formErrors.department && (
                      <p className="text-xs text-red-500">
                        {formErrors.department}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="designation">Designation {!newUser.designation && <span className="text-red-500">*</span>}</Label>
                    <Input
                      id="designation"
                      name="designation"
                      value={newUser.designation}
                      onChange={handleInputChange}
                      className={`bg-[#222222] border-gray-700 ${
                        formErrors.designation ? "border-red-500" : ""
                      }`}
                      placeholder="e.g. Sales Head, Marketing Manager"
                    />
                    {formErrors.designation && (
                      <p className="text-xs text-red-500">
                        {formErrors.designation}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      name="role"
                      value={newUser.role}
                      onChange={handleInputChange}
                      className={`bg-[#222222] border border-gray-700 rounded-md p-2 ${
                        formErrors.role ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select a role</option>
                      <option value="user">User</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                      <option value="organization_owner">
                        Organization Owner
                      </option>
                    </select>
                    {formErrors.role && (
                      <p className="text-xs text-red-500">{formErrors.role}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => {
                      setDialogOpen(false);
                      setFormErrors({});
                      setNewUser({
                        name: "",
                        email: "",
                        phone: "",
                        department: "",
                        designation: "",
                        role: "user",
                        organizationRoles: currentOrganization
                          ? [
                              {
                                organizationId: currentOrganization._id,
                                role: "user",
                              },
                            ]
                          : [],
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddUser}
                    className="bg-white text-black hover:bg-gray-200"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding..." : "Add User"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </AccessControl>

          {/* Add the edit user dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px] bg-[#111111] text-white border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Edit User
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Name {!userToEdit?.name && <span className="text-red-500">*</span>}</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={userToEdit?.name || ""}
                    onChange={handleEditInputChange}
                    className={`bg-[#222222] border-gray-700 ${
                      formErrors.name ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-500">{formErrors.name}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email {!userToEdit?.email && <span className="text-red-500">*</span>}</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={userToEdit?.email || ""}
                    onChange={handleEditInputChange}
                    className={`bg-[#222222] border-gray-700 ${
                      formErrors.email ? "border-red-500" : ""
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-500">{formErrors.email}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Phone Number {!userToEdit?.phone && <span className="text-red-500">*</span>}</Label>
                  <Input
                    maxLength={10}
                    minLength={10}
                    id="edit-phone"
                    name="phone"
                    type="tel"
                    value={userToEdit?.phone || ""}
                    onChange={handleEditInputChange}
                    className={`bg-[#222222] border-gray-700 ${
                      formErrors.phone ? "border-red-500" : ""
                    }`}
                    onKeyDown={(e) => {
                      const allowedKeys = [
                        "Backspace",
                        "Tab",
                        "ArrowLeft",
                        "ArrowRight",
                        "Delete",
                      ];
                      if (
                        !/[0-9]/.test(e.key) &&
                        !allowedKeys.includes(e.key)
                      ) {
                        e.preventDefault();
                      }
                    }}
                  />
                  {formErrors.phone && (
                    <p className="text-xs text-red-500">{formErrors.phone}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-department">Department {!userToEdit?.department && <span className="text-red-500">*</span>}</Label>
                  <Input
                    id="edit-department"
                    name="department"
                    value={userToEdit?.department || ""}
                    onChange={handleEditInputChange}
                    className={`bg-[#222222] border-gray-700 ${
                      formErrors.department ? "border-red-500" : ""
                    }`}
                    placeholder="e.g. Sales, Marketing, Engineering"
                  />
                  {formErrors.department && (
                    <p className="text-xs text-red-500">
                      {formErrors.department}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-designation">Designation {!userToEdit?.designation && <span className="text-red-500">*</span>}</Label>
                  <Input
                    id="edit-designation"
                    name="designation"
                    value={userToEdit?.designation || ""}
                    onChange={handleEditInputChange}
                    className={`bg-[#222222] border-gray-700 ${
                      formErrors.designation ? "border-red-500" : ""
                    }`}
                    placeholder="e.g. Sales Head, Marketing Manager"
                  />
                  {formErrors.designation && (
                    <p className="text-xs text-red-500">
                      {formErrors.designation}
                    </p>
                  )}
                </div>
                <AccessControl requiredPermissions={[Permission.MANAGE_USERS]}>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-role">Role</Label>
                    <select
                      id="edit-role"
                      name="role"
                      value={userToEdit?.role || ""}
                      onChange={handleEditInputChange}
                      className={`bg-[#222222] border border-gray-700 rounded-md p-2 ${
                        formErrors.role ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select a role</option>
                      <option value="user">User</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                      <option value="organization_owner">
                        Organization Owner
                      </option>
                    </select>
                    {formErrors.role && (
                      <p className="text-xs text-red-500">{formErrors.role}</p>
                    )}
                  </div>
                </AccessControl>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => {
                    setEditDialogOpen(false);
                    setUserToEdit(null);
                    setFormErrors({});
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditUser}
                  className="bg-white text-black hover:bg-gray-200"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update User"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">
            Loading users...
          </div>
        ) : error ? (
          <Alert
            variant="destructive"
            className="bg-red-900/20 border-red-800 mb-6"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No users found. Add your first user to get started.
          </div>
        ) : (
          <div className="py-4 h-[48.5rem] overflow-y-scroll scroll-smooth scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hide-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {users.map((user) => (
                <UserCard key={user._id} user={user} onEdit={openEditDialog} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function UserCard({
  user,
  onEdit
}: {
  user: User;
  onEdit: (user: User) => void;
}) {
  const { currentOrganization } = useOrganization();
  const { userRole } = usePermissions();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
   const { toast } = useToast();
  const { user: userCheck } = useAuth();

  const handleResetPassword = async (user:any) => {
    const resetPasswordId=user?._id
    try {
      await axiosInstance.patch(`/users/reset-password-byAdmin`, {resetPasswordId:resetPasswordId});
      toast({
        title: "User password updated",
        description: `Password updated and resent to ${user.name}'s email.`,
      });
    } catch (error: any) {
      console.error("Error updating user:", error);
      // Handle different error types
      if (error.response) {
        const status = error.response.status;
        const errorMessage =
          error.response.data.message || "Failed to update user";
        if (status === 400) {
            toast({
              title: "Bad Request Error",
              description: errorMessage,
              variant: "destructive",
            });
          
        } else if (status === 401) {
          toast({
            title: "Unauthorized",
            description: "Please log in again to update users",
            variant: "destructive",
          });
        } else if (status === 403) {
          toast({
            title: "Permission Denied",
            description: "You don't have permission to update users",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } else if (error.request) {
        toast({
          title: "Network Error",
          description: "Please check your connection and try again",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to update user",
          variant: "destructive",
        });
      }
    } finally {
      setIsMenuOpen(false);
    }
  };
    // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get the user's role for the current organization
  const getUserRoleInCurrentOrg = () => {
    if (!currentOrganization || !user.organizationRoles) return user.role;
    const orgRole = user.organizationRoles.find(
      (r) => r.organizationId === currentOrganization._id
    );
    return orgRole ? orgRole.role : user.role;
  };

  const targetUserRole = getUserRoleInCurrentOrg();
  // console.log(targetUserRole);
  const checkUserRole = userCheck.organizationRoles.find((item:any)=>item.organizationId == localStorage.getItem('currentOrganizationId'));
  // console.log(checkUserRole.role);
  
  // const showMenu = !(targetUserRole === "organization_owner");
  // console.log(showMenu, 'Show');
  
  // Check if current user can edit this user
  const canEditUser = () => {
    if (userRole === "organization_owner") {
      return targetUserRole !== "organization_owner";
    }

    if (userRole === "admin") {
      return targetUserRole === "user" || targetUserRole === "manager";
    }

    // Managers can only edit users
    if (userRole === "manager") {
      return targetUserRole === "user";
    }

    // Regular users cannot edit anyone
    return false;
  };

   // Check if current user can reset password for this user
  const canResetPassword = () => {
    //  if(userRole === "admin" || userRole === "organization_owner") {
    //    return    targetUserRole !== "organization_owner";
    // }
     if(userRole === "organization_owner") {
       return    targetUserRole !== "organization_owner";
    }
  };

  // Get performance color based on status
  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case "Good":
        return "bg-green-500";
      case "Need Improvement":
        return "bg-yellow-500";
      case "Critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get text color for performance label
  const getTextColor = (performance: string) => {
    return performance === "Need Improvement"
      ? "text-yellow-500"
      : performance === "Critical"
      ? "text-red-500"
      : "text-green-500";
  };

  // Get background color for progress bar track
  const getTrackColor = (performance: string) => {
    return performance === "Need Improvement"
      ? "bg-yellow-900/50"
      : performance === "Critical"
      ? "bg-red-900/50"
      : "bg-green-900/50";
  };  
  return (
    <div className="bg-[#111111] rounded-lg overflow-hidden relative">
      {/* Three-dot menu button */}
      {/* {showMenu && ( */}
      {(isMenuOpen || (checkUserRole?.role == 'organization_owner' || checkUserRole?.role ==='admin')) && (
        <div className="absolute top-2 right-2" ref={menuRef}>
          <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white hover:cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          {/* Dropdown menu */}
          {(isMenuOpen && (checkUserRole?.role == 'organization_owner' || checkUserRole?.role ==='admin')) && (
            <div className="absolute right-0 mt-2 w-48 bg-[#222222] rounded-md shadow-lg z-10 border border-gray-700">
              {(canEditUser() || (checkUserRole?.role == 'organization_owner' || checkUserRole?.role ==='admin')) && (
                <button
                  onClick={() => {
                    onEdit(user);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                >
                  Edit User
                </button>
              )}
              {(canResetPassword()|| (checkUserRole?.role == 'organization_owner' || checkUserRole?.role ==='admin')) &&(
                <button
                  onClick={() => {
                    handleResetPassword(user);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                >
                  Resend Invite
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="p-6 flex flex-col items-center">
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-full overflow-hidden">
            {user.avatar && user.avatar !== "" ? (
              <img
                src={user.avatar || "/placeholder.svg"}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-semibold">
                  {user.name
                    .split(" ")
                    .map((name) => name[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-lg font-medium text-center">{user.name}</h3>
        <p className="text-sm text-gray-400 text-center">{user.designation}</p>
        {user.department && (
          <p className="text-xs text-gray-500 text-center">{user.department}</p>
        )}
        <div className="mt-1 flex gap-1 flex-wrap justify-center">
          {targetUserRole && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400">
              {targetUserRole.charAt(0).toUpperCase() + targetUserRole.slice(1)}
            </span>
          )}
          {targetUserRole === "organization_owner" && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/30 text-purple-400">
              Creator
            </span>
          )}
        </div>
        <div className="flex gap-2 mb-4 mt-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#222222]">
            {user.kpiCount?.toString().padStart(2, "0") || "00"} KPIs
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#222222]">
            {user.priorityCount?.toString().padStart(2, "0") || "00"} Priorities
          </span>
        </div>

        <div className="w-full">
          <div className="flex justify-between text-sm mb-1">
            <span>Performance</span>
            <span className={getTextColor(user.performance || "")}>
              {user.performance}
            </span>
          </div>
          <div
            className={`w-full h-2 rounded-full ${getTrackColor(
              user.performance || ""
            )}`}
          >
            <div
              className={`h-2 rounded-full ${getPerformanceColor(
                user.performance || ""
              )}`}
              style={{ width: `${user.performanceValue || 0}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
