import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions, Permission } from "@/contexts/PermissionsContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requireAllPermissions?: boolean;
}

/**
 * A route component that protects routes based on authentication and permissions
 * 
 * @param children - The component to render if the user has access
 * @param requiredPermissions - Permissions required to access this route
 * @param requireAllPermissions - If true, user must have ALL permissions. If false, ANY permission is sufficient.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requireAllPermissions = false,
}) => {
  const { user, loading } = useAuth();
  const { hasAllPermissions, hasAnyPermission } = usePermissions();

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }


  // If no permissions are required, proceed
  if (requiredPermissions.length === 0) {
    return <>{children}</>;
  }

  // Check permissions based on requirement type
  const hasPermission = requireAllPermissions
    ? hasAllPermissions(requiredPermissions)
    : hasAnyPermission(requiredPermissions);


  // Redirect to unauthorized page if permissions check fails
  if (!hasPermission) {
    return <Navigate to="/unauthorized" />;
  }

  // User has necessary permissions, render the route
  return <>{children}</>;
};

export default ProtectedRoute; 