"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "@/axios";
import { Toaster } from "@/components/ui/toaster";

export interface UserRole {
  organizationId: string;
  role: string;
}

interface User {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: string; // Global role (for backward compatibility)
  organizationRoles: UserRole[]; // Organization-specific roles
  organizationId: string;
  isUserEdit: boolean
}

export interface Organization {
  _id: string;
  name: string;
  isActive: boolean;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  organizations: Organization[];
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  getUserRoleInCurrentOrg: () => string | null;
  refreshTokenWithCurrentOrg: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axiosInstance
        .get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUser(response.data);
          setOrganizations(response.data.organizations || []);
        })
        .catch((err) => {
          console.log(err);
          localStorage.removeItem("token");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Get the user's role in the current organization
  const getUserRoleInCurrentOrg = (): string | null => {
    if (!user) return null;
    
    const currentOrgId = localStorage.getItem("currentOrganizationId");
    // Check if we have an organization-specific role
    const orgRole = user.organizationRoles?.find(
      (r) => r.organizationId === currentOrgId
    );
    
    if (orgRole) {
      return orgRole.role;
    }
    
    // Fallback to global role if no org-specific role is found
    return user.role;
  };

  // Refresh the user's token with current organization information
  const refreshTokenWithCurrentOrg = async () => {
    if (!user || !user.organizationId) return;
    
    try {
      const response = await axiosInstance.post('/auth/update-token', {
        organizationId: user.organizationId,
      });
      
      // Update the token
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);        
        // Reload user data to get updated permissions
        await axiosInstance
          .get('/auth/me')
          .then((response) => {
            setUser(response.data);
            setOrganizations(response.data.organizations || []);
          });
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
      setOrganizations(response.data.organizations || []);
    } catch (err: any) {
      // Instead of storing the error, throw it to be handled by the component
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/auth/signup", {
        name,
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
      setOrganizations(response.data.organizations || []);
    } catch (err: any) {
      // Instead of storing the error, throw it to be handled by the component
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setOrganizations([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organizations,
        loading,
        login,
        signup,
        logout,
        getUserRoleInCurrentOrg,
        refreshTokenWithCurrentOrg,
      }}
    >
      {children}
      <Toaster />
    </AuthContext.Provider>
  );
};
