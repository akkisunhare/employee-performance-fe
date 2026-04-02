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

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await login(formData.email, formData.password);
      toast({
        title: "Success",
        description: "You have successfully logged in",
      });
      navigate("/select-organization");
      // navigate("/dashboard");
    } catch (err: any) {
      // Handle the error with toast
      const errorMessage = err.response?.data?.message || "Failed to login";
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Login</CardTitle>
          <CardDescription className="text-zinc-400">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">
                Password
              </Label>
              <div className="relative">
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-white"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {!showPassword ? (
                    <EyeOff className="text-black" size={18} />
                  ) : (
                    <Eye className="text-black" size={18} />
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              type="submit"
              className="w-full"
              disabled={loading || isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-gray-400">
            Don't have an account?{" "}
            <Button
              variant="link"
              onClick={() => navigate("/signup")}
              className="text-white p-0"
              disabled={loading || isSubmitting}
            >
              Sign up
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
