"use client";
import type React from "react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic client-side validation
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await signup(formData.name, formData.email, formData.password);
      toast({
        title: "Success",
        description: "Your account has been created successfully",
      });
      navigate("/select-organization");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to sign up";
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">
            Sign Up
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Create a new account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-200">
                Name
              </Label>
              <Input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-zinc-800 border-zinc-700 text-white"
                required
                disabled={loading || isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="bg-zinc-800 border-zinc-700 text-white"
                required
                disabled={loading || isSubmitting}
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-gray-200">
                Password
              </Label>
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="bg-zinc-800 border-zinc-700 text-white"
                required
                disabled={loading || isSubmitting}
              />
              <div
                  className="absolute right-3 top-[38px] transform -translate-y-1/2 cursor-pointer text-white"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {!showPassword ? (
                    <EyeOff className="text-black" size={18} />
                  ) : (
                    <Eye className="text-black" size={18} />
                  )}
                </div>
            </div>
            <Button
              variant="secondary"
              type="submit"
              className="w-full"
              disabled={loading || isSubmitting}
            >
              {isSubmitting ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-gray-400">
            Already have an account?{" "}
            <Button
              variant="link"
              onClick={() => navigate("/login")}
              className="text-white p-0"
              disabled={loading || isSubmitting}
            >
              Login
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
