import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import axios from "@/axios";

const UserSettings: React.FC = () => {
  const { refreshTokenWithCurrentOrg } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [roleInfo, setRoleInfo] = useState<any>(null);
  const [showRoleInfo, setShowRoleInfo] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("/users/reset-password", {
        oldPassword,
        newPassword,
      });
      
      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated successfully",
      });
      
      // Close dialog and reset form
      setIsOpen(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Password reset failed:", error);
      toast({
        title: "Password Reset Failed",
        description: error.response?.data?.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckRole = async () => {
    try {
      const response = await axios.get("/auth/role");
      setRoleInfo(response.data);
      setShowRoleInfo(true);
      
      if (response.data.role !== 'organization_owner') {
        // If not owner, try refreshing token
        await refreshTokenWithCurrentOrg();
        const updatedResponse = await axios.get("/auth/role");
        setRoleInfo(updatedResponse.data);
      }
    } catch (error) {
      console.error("Failed to check role:", error);
      toast({
        title: "Error",
        description: "Failed to check your current role",
        variant: "destructive",
      });
    }
  };

  const refreshRole = async () => {
    try {
      await refreshTokenWithCurrentOrg();
      toast({
        title: "Refreshed",
        description: "Your role information has been refreshed. Reloading page...",
      });
      
      // Reload after a short delay to let the user see the toast
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Failed to refresh role:", error);
      toast({
        title: "Error",
        description: "Failed to refresh your role",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex space-x-4">
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="text-gray-600 hover:text-black"
      >
        Change Password
      </Button>
      
      <Button
        onClick={handleCheckRole}
        variant="outline"
        className="text-gray-600 hover:text-black"
      >
        Check My Role
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-zinc-900 text-white border-gray-800">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update your password to secure your account.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="oldPassword" className="text-sm font-medium">
                Current Password
              </label>
              <input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#ffffff] text-black border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#ffffff] text-black border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[#ffffff] border text-black border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border-gray-700 text-black"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showRoleInfo} onOpenChange={setShowRoleInfo}>
        <DialogContent className="bg-gray-900 text-white border-gray-800">
          <DialogHeader>
            <DialogTitle>Your Current Role</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {roleInfo && (
              <div className="space-y-2">
                <p><strong>Role :-</strong> {roleInfo.role}</p>
                <p><strong>Organization ID :-</strong> {roleInfo.organizationId}</p>
                <p><strong>User ID :-</strong> {roleInfo.userId}</p>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              onClick={refreshRole}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Refresh Permissions
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRoleInfo(false)}
              className="border-gray-700 text-black"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserSettings; 