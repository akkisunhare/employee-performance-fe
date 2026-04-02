"use client";

import axios from "@/axios";
import { useToast } from "@/hooks/use-toast";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

interface Organization {
  _id: string;
  name: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface OrganizationContextType {
  organizations: Organization[];
  currentOrganization: Organization | null;
  loading: boolean;
  createOrganization: (name: string) => Promise<void>;
  selectOrganization: (organizationId: string) => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | null>(null);

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error(
      "useOrganization must be used within an OrganizationProvider"
    );
  }
  return context;
};

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>(
    []
  );
  const [currentOrganization, setCurrentOrganization] =
    useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const { organizations } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const initializeOrganizations = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const storedOrgId = localStorage.getItem("currentOrganizationId");

        if (token) {
          const { data } = await axios.get("/auth/me");
          const userOrganizations = (data?.organizations || []) as Organization[];
          setUserOrganizations(userOrganizations);

          if (userOrganizations.length > 0) {
            // If we have a stored organization ID, use that
            if (storedOrgId) {
              const storedOrg = userOrganizations.find((org: Organization) => org?._id === storedOrgId);
              if (storedOrg) {
                setCurrentOrganization(storedOrg);
              } else {
                // If stored org is not found, use the first one
                setCurrentOrganization(userOrganizations[0]);
                localStorage.setItem("currentOrganizationId", userOrganizations[0]._id);
              }
            } else {
              // If no stored org, use the first one
              setCurrentOrganization(userOrganizations[0]);
              localStorage.setItem("currentOrganizationId", userOrganizations[0]._id);
            }
          }
        } else {
          setUserOrganizations([]);
          setCurrentOrganization(null);
          localStorage.removeItem("currentOrganizationId");
        }
      } catch (err: any) {
        console.error("Failed to load organizations:", err);
        setUserOrganizations([]);
        setCurrentOrganization(null);
        localStorage.removeItem("currentOrganizationId");
      } finally {
        setLoading(false);
      }
    };

    initializeOrganizations();
  }, [organizations]);

  const createOrganization = async (name: string) => {
    try {
      // Create the organization
      const response = await axios.post("/organisations", { name });
      const newOrg = response.data as Organization;
      setUserOrganizations([...userOrganizations, newOrg]);
      setCurrentOrganization(newOrg);
      localStorage.setItem("currentOrganizationId", newOrg._id);

      // Update the token with the new organization ID
      const tokenResponse = await axios.post("/auth/update-token", {
        organizationId: newOrg._id,
      });
      localStorage.setItem("token", tokenResponse.data.token);
      
      // Notify user of successful creation
      toast({
        title: "Organization created",
        description: `${name} has been created successfully and you've been set as the owner.`,
      });
      
      // Force refresh to update permissions
      setTimeout(() => {
        window.location.reload();
      }, 500); // Small delay to allow backend to complete role assignment
    } catch (err: any) {
      console.error("Failed to create organization:", err);
      toast({
        title: "Failed to create organization",
        description: err.response?.data?.message || "An unexpected error occurred",
        variant: "destructive",
      });
      throw err;
    }
  };

  const selectOrganization = async (organizationId: string) => {
    try {
      const organization = userOrganizations.find(
        (org) => org._id === organizationId
      );
      if (organization) {
        setCurrentOrganization(organization);
        localStorage.setItem("currentOrganizationId", organizationId);

        const tokenResponse = await axios.post("/auth/update-token", {
          organizationId,
        });
        localStorage.setItem("token", tokenResponse.data.token);
      }
    } catch (err: any) {
      console.error("Failed to select organization:", err);
      throw err;
    }
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations: userOrganizations,
        currentOrganization,
        loading,
        createOrganization,
        selectOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};
