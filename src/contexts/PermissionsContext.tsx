"use client";

import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { useOrganization } from "./OrganizationContext";

// Define permission types
export enum Permission {
  // KPI permissions
  CREATE_INDIVIDUAL_KPI="CREATE_INDIVIDUAL_KPI",
  VIEW_INDIVIDUAL_KPI = "VIEW_INDIVIDUAL_KPI",
  EDIT_INDIVIDUAL_KPI = "EDIT_INDIVIDUAL_KPI",
  CREATE_TEAM_KPI= "CREATE_TEAM_KPI",
  VIEW_TEAM_KPI = "VIEW_TEAM_KPI",
  EDIT_TEAM_KPI = "EDIT_TEAM_KPI",
  CREATE_ALL_KPI= "CREATE_ALL_KPI",
  VIEW_ALL_KPI = "VIEW_ALL_KPI",
  EDIT_ALL_KPI = "EDIT_ALL_KPI",

  // Priority permissions
  CREATE_OWN_PRIORITY = "CREATE_OWN_PRIORITY",
  VIEW_OWN_PRIORITY = "VIEW_OWN_PRIORITY",
  EDIT_OWN_PRIORITY = "EDIT_OWN_PRIORITY",
  CREATE_TEAM_PRIORITY = "CREATE_TEAM_PRIORITY",
  VIEW_TEAM_PRIORITY = "VIEW_TEAM_PRIORITY",
  EDIT_TEAM_PRIORITY = "EDIT_TEAM_PRIORITY",
  CREATE_ALL_PRIORITY = "CREATE_ALL_PRIORITY",
  VIEW_ALL_PRIORITY = "VIEW_ALL_PRIORITY",
  EDIT_ALL_PRIORITY = "EDIT_ALL_PRIORITY",
  
  // Dashboard permissions
  VIEW_INDIVIDUAL_DASHBOARD = "VIEW_INDIVIDUAL_DASHBOARD",
  VIEW_TEAM_DASHBOARD = "VIEW_TEAM_DASHBOARD",
  VIEW_COMPANY_DASHBOARD = "VIEW_COMPANY_DASHBOARD",
  
  // User management permissions
  VIEW_USERS = "VIEW_USERS",
  MANAGE_USERS = "MANAGE_USERS",
  
  // Team management permissions
  VIEW_TEAMS = "VIEW_TEAMS",
  MANAGE_TEAMS = "MANAGE_TEAMS",
  
  // Configuration permissions
  MANAGE_CONFIGURATION = "MANAGE_CONFIGURATION",
  EDIT_OWN_KPI = "EDIT_OWN_KPI",

  MANAGE_Settings = "MANAGE_Settings"
}

// Define role types
export enum Role {
  USER = "user",
  MANAGER = "manager",
  ADMIN = "admin",
  ORGANIZATION_OWNER = "organization_owner"
}

// Define role-permission mapping
const rolePermissions: Record<Role, Permission[]> = {
  [Role.USER]: [
    Permission.VIEW_INDIVIDUAL_KPI,
    Permission.EDIT_INDIVIDUAL_KPI,
    Permission.CREATE_INDIVIDUAL_KPI,

    Permission.VIEW_TEAM_KPI,
    Permission.VIEW_INDIVIDUAL_DASHBOARD,
    Permission.VIEW_TEAM_DASHBOARD,
    Permission.VIEW_COMPANY_DASHBOARD,

    Permission.VIEW_USERS,
    Permission.VIEW_TEAMS,
    // Priority permissions for USER
    Permission.CREATE_OWN_PRIORITY,
    Permission.VIEW_OWN_PRIORITY,
    Permission.EDIT_OWN_PRIORITY,
    Permission.VIEW_TEAM_PRIORITY,

  ],
  [Role.MANAGER]: [
    // Manager has all user permissions
    Permission.CREATE_INDIVIDUAL_KPI,
    Permission.VIEW_INDIVIDUAL_KPI,
    Permission.EDIT_INDIVIDUAL_KPI,

    Permission.CREATE_TEAM_KPI,
    Permission.VIEW_TEAM_KPI,
    Permission.EDIT_TEAM_KPI,  

    Permission.VIEW_INDIVIDUAL_DASHBOARD,
    Permission.VIEW_TEAM_DASHBOARD,
    Permission.VIEW_COMPANY_DASHBOARD,

    // Plus team management permissions
    Permission.VIEW_TEAM_KPI,
    Permission.EDIT_TEAM_KPI,
    Permission.VIEW_TEAMS,
    Permission.MANAGE_TEAMS,
    Permission.VIEW_USERS,
    Permission.MANAGE_USERS,

    // Priority permissions for MANAGER
    Permission.CREATE_OWN_PRIORITY,
    Permission.VIEW_OWN_PRIORITY,
    Permission.EDIT_OWN_PRIORITY,
    Permission.CREATE_TEAM_PRIORITY,
    Permission.VIEW_TEAM_PRIORITY,
    Permission.EDIT_TEAM_PRIORITY,
    Permission.VIEW_ALL_PRIORITY,

  ],
  [Role.ADMIN]: [
    // Admin has all permissions
  
    Permission.CREATE_INDIVIDUAL_KPI,
    Permission.CREATE_TEAM_KPI,
    Permission.CREATE_ALL_KPI,

    Permission.VIEW_INDIVIDUAL_KPI,
    Permission.VIEW_TEAM_KPI,
    Permission.VIEW_ALL_KPI,
   
    Permission.EDIT_INDIVIDUAL_KPI,
    Permission.EDIT_TEAM_KPI,
    Permission.EDIT_ALL_KPI,
 
    Permission.VIEW_INDIVIDUAL_DASHBOARD,
    Permission.VIEW_TEAM_DASHBOARD,
    Permission.VIEW_COMPANY_DASHBOARD,

    Permission.VIEW_USERS,
    Permission.MANAGE_USERS,
    Permission.VIEW_TEAMS,
    Permission.MANAGE_TEAMS,
    Permission.MANAGE_CONFIGURATION,

    // Priority permissions for ADMIN
    Permission.CREATE_ALL_PRIORITY,
    Permission.CREATE_OWN_PRIORITY,
    Permission.CREATE_TEAM_PRIORITY,
    Permission.VIEW_OWN_PRIORITY,
    Permission.VIEW_ALL_PRIORITY,
    Permission.VIEW_TEAM_PRIORITY,
    Permission.EDIT_ALL_PRIORITY,
    Permission.EDIT_OWN_PRIORITY,
    Permission.EDIT_TEAM_PRIORITY,


    Permission.MANAGE_Settings,
  
  ],
  [Role.ORGANIZATION_OWNER]: [
    // Organization owner has all permissions (same as admin)
    Permission.CREATE_INDIVIDUAL_KPI,
    Permission.CREATE_ALL_KPI,
    Permission.CREATE_TEAM_KPI,

    Permission.VIEW_INDIVIDUAL_KPI,
    Permission.VIEW_TEAM_KPI,
    Permission.VIEW_ALL_KPI,

    Permission.EDIT_INDIVIDUAL_KPI,
    Permission.EDIT_TEAM_KPI,
    Permission.EDIT_ALL_KPI,
    
    Permission.VIEW_INDIVIDUAL_DASHBOARD,
    Permission.VIEW_TEAM_DASHBOARD,
    Permission.VIEW_COMPANY_DASHBOARD,
    
    Permission.VIEW_USERS,
    Permission.MANAGE_USERS,
    Permission.VIEW_TEAMS,
    Permission.MANAGE_TEAMS,
    Permission.MANAGE_CONFIGURATION,

    // Priority permissions for ORGANIZATION_OWNER
    Permission.CREATE_ALL_PRIORITY,
    Permission.CREATE_OWN_PRIORITY,
    Permission.CREATE_TEAM_PRIORITY,
    Permission.VIEW_OWN_PRIORITY,
    Permission.VIEW_ALL_PRIORITY,
    Permission.VIEW_TEAM_PRIORITY,
    Permission.EDIT_ALL_PRIORITY,
    Permission.EDIT_OWN_PRIORITY,
    Permission.EDIT_TEAM_PRIORITY,

    Permission.MANAGE_Settings,
  ],
};


interface PermissionsContextType {
  userRole: Role | null;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | null>(null);

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
};

interface PermissionsProviderProps {
  children: ReactNode;
}

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children }) => {
  const {  getUserRoleInCurrentOrg } = useAuth();
  const { currentOrganization } = useOrganization();
  
  // Get user's role in the current organization
  const userRole = useMemo(() => {
    const roleInCurrentOrg = getUserRoleInCurrentOrg();
    
    if (!roleInCurrentOrg) {
      return Role.USER;
    }
    
    const role = roleInCurrentOrg.toLowerCase() as Role;
    return role;
  }, [getUserRoleInCurrentOrg,currentOrganization]);
  
  // Check if user has a specific permission
  const hasPermission = (permission: Permission): boolean => {
    if (!userRole) return false;
    const hasRolePermission = rolePermissions[userRole]?.includes(permission) || false;
    
  
    return hasRolePermission;
  };
  
  // Check if user has any of the provided permissions
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions?.some(permission => hasPermission(permission));
  };
  
  // Check if user has all of the provided permissions
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions?.every(permission => hasPermission(permission));
  };
  
  const value = {
    userRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};