import React from "react";
import { usePermissions, Permission } from "@/contexts/PermissionsContext";

interface AccessControlProps {
  children: React.ReactNode;
  requiredPermissions: Permission[];
  requireAllPermissions?: boolean;
  fallback?: React.ReactNode;
  allowOrganizationCreator?: boolean;
}

/**
 * Component that conditionally renders its children based on user permissions
 * 
 * @param children - The content to render if the user has the required permissions
 * @param requiredPermissions - The permissions required to view the children
 * @param requireAllPermissions - If true, the user must have ALL permissions. If false, ANY permission is sufficient.
 * @param fallback - Optional content to render if the user doesn't have the required permissions
 * @param allowOrganizationCreator - If true, organization creators always have access regardless of role
 */
const AccessControl: React.FC<AccessControlProps> = ({
  children,
  requiredPermissions,
  requireAllPermissions = false,
  fallback = null,

}) => {
  
  const { hasAllPermissions, hasAnyPermission } = usePermissions();

 
  // Check if user has the required permissions
  const hasPermission =
    requiredPermissions?.length === 0 ||
    (requireAllPermissions
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions));

  // Render children if user has permission, otherwise render fallback content
  return <>{hasPermission ? children : fallback}</>;
};

export default AccessControl; 