"use client";

import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/axios";
import UserSettings from "./UserSettings";
import { DashboardSvg, KPISvg, PrioritiesSvg, TeamsSvg, UserSvg } from "@/assets/GoalsImage";

export default function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isOpen, setIsOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isUserSettingsOpen, setIsUserSettingsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const menuItems = [
    { name: "Dashboard", icon: <DashboardSvg />, path: "/dashboard" },
    { name: "KPIs", icon: <KPISvg />, path: "/kpis" },
    { name: "Priorities", icon: <PrioritiesSvg />, path: "/Priorities" },
    { name: "Teams", icon: <TeamsSvg />, path: "/teams" },
    { name: "Users", icon: <UserSvg />, path: "/users" },
    { name: "Settings", icon: <KeyRound className="text-[#FFFFFF]"/>, path: "/settings" },
  ];

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Your new password and confirmation don't match",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);

    try {
      await axiosInstance.post("/users/reset-password", {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      setIsResetDialogOpen(false);
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast({
        title: "Success",
        description: "Your password has been changed successfully",
      });
    } catch (error) {
      console.error("Failed to reset password:", error);
      toast({
        title: "Error",
        description:
          "Failed to reset your password. Please check your current password and try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!user) {
    return null;
  }
  const useOutsideClick = (callback: () => void) => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          callback();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [callback]);
    return ref;
  };
  const dropdownRef = useOutsideClick(() => {
    setIsOpen(false);
  });

  return (
    <div className="flex flex-col h-screen bg-[#080808] text-[#FFFFFF] w-72 ">
      {/* User Profile */}
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center p-4 my-4">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarFallback className="bg-gray-300 text-black">
              {user.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-medium text-base ">{user.name}</h3>
            <p className="text-xs text-[#FFFFFF] capitalize">
              {user?.organizationRoles[0].role}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronDown
              className={`size-7 transition-transform duration-200 ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </Button>
        </div>

        {isOpen && (
          <div className="absolute top-18 right-4 w-48 py-2 bg-zinc-800 rounded-md shadow-xl z-20">
            <button
              onClick={() => {
                setIsUserSettingsOpen(true);
                setIsOpen(false);
              }}
              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700 w-full text-left"
            >
              User Settings
              {/* <KeyRound size={16} className="ml-3" /> */}
            </button>
            <Link to={"/select-organization"}>
              <button className="block px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700 w-full text-left">
                Switch Organization
              </button>
            </Link>
            <button
              onClick={() => {
                logout();
                localStorage.setItem("selectedKpiType", "individual");
                setIsOpen(false);
              }}
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700 w-full text-left">
              Logout
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1 ">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center w-full px-3 py-2.5 rounded-md text-base font-medium transition-colors",
                  currentPath === item.path
                    ? "bg-zinc-800"
                    : "hover:bg-zinc-900"
                )}
              >
                <span className="mr-3 text-gray-400">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Settings Dialog */}
      <Dialog open={isUserSettingsOpen} onOpenChange={setIsUserSettingsOpen}>
        <DialogContent className="sm:max-w-[500px] bg-zinc-900 text-white border-gray-800">
          <DialogHeader>
            <DialogTitle>User Settings</DialogTitle>
            <DialogDescription className="text-gray-400">
              Manage your account settings and preferences
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <UserSettings />
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog - Old implementation, kept for reference */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new password to update your
              credentials.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordChange}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="oldPassword" className="text-right">
                  Current
                </Label>
                <Input
                  id="oldPassword"
                  name="oldPassword"
                  type="password"
                  className="col-span-3"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordInputChange}
                  autoComplete="current-password"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newPassword" className="text-right">
                  New
                </Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  className="col-span-3"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                  autoComplete="new-password"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="confirmPassword" className="text-right">
                  Confirm
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="col-span-3"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isResetting}>
                {isResetting ? "Changing..." : "Change Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
