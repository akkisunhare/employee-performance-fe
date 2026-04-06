"use client";

import type React from "react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganization } from "@/contexts/OrganizationContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function OrganizationSelect() {
  const navigate = useNavigate();
  const { organizations, createOrganization, selectOrganization, loading } =
    useOrganization();
  const { toast } = useToast();
  const [newOrgName, setNewOrgName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newOrgName.trim()) {
      toast({
        title: "Validation Error",
        description: "Organization name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      await createOrganization(newOrgName);
      toast({
        title: "Success",
        description: "Organization created successfully",
      });
      // navigate("/dashboard");
      setNewOrgName("");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to create organization";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectOrganization = async (organizationId: string) => {
    try {
      setIsSelecting(true);
      await selectOrganization(organizationId);
      toast({
        title: "Success",
        description: "Organization selected successfully",
      });
      navigate("/dashboard");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to select organization";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSelecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading.....
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">
            Select Organization
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Create a new organization or select an existing one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {organizations.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Your Organizations
                </h3>
                {organizations.map((org) => (
                  <Button
                    key={org._id}
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    onClick={() => handleSelectOrganization(org._id)}
                    disabled={isSelecting || isCreating}
                  >
                    {org.name}
                  </Button>
                ))}
              </div>
            )}
            <div className="h-1 bg-zinc-800"></div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Create New Organization
              </h3>
              <form onSubmit={handleCreateOrganization} className="space-y-4">
                <div className="space-y-4">
                  <Label htmlFor="orgName" className="text-gray-200">
                    Organization Name
                  </Label>
                  <Input
                    type="text"
                    id="orgName"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    required
                    disabled={isCreating || isSelecting}
                  />
                </div>
                <Button
                  variant="secondary"
                  type="submit"
                  className="w-full"
                  disabled={isCreating || isSelecting}
                >
                  {isCreating ? "Creating..." : "Create Organization"}
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
