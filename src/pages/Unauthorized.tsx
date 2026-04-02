"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-4">
      <div className="max-w-md mx-auto text-center">
        <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-400 mb-8">
          You don't have permission to access this page. If you believe this is
          an error, please contact your administrator.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="bg-white text-black hover:bg-gray-200"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
} 