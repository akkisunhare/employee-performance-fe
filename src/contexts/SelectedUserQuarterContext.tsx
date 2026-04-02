import { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Define types for the context values
export type SelectedUserQuarterContextType = {
  selectedUser: any;
  setSelectedUser: (user: any) => void;
  selectedQuarter: any;
  setSelectedQuarter: (quarter: any) => void;
  selectedSingleUser: any;
  setSelectedSingleUser: (singleuser: any) => void;
  singleQuarter: any;
  setSingleQuarter: (singlequarter) => void;
  dashboardType: any;
  setDashboardType: (dashboardType) => void;
};

const SelectedUserQuarterContext = createContext<
  SelectedUserQuarterContextType | undefined
>(undefined);

export const SelectedUserQuarterProvider = ({
  children,
}: {
  children: ReactNode;
}) => {

  const [selectedUser, setSelectedUser] = useState<any>([]);
  const [selectedQuarter, setSelectedQuarter] = useState<any>([]);
  // const [selectedQuarter, setSelectedQuarter] = useState<any>(['q2-2025']);
  const [selectedSingleUser, setSelectedSingleUser] = useState<any>([]);
  const [singleQuarter, setSingleQuarter] = useState<any>([]);  
  const [dashboardType, setDashboardType] = useState<any>(localStorage.getItem('selectedDashType') || 'myDashboard');

   useEffect(() => {
      const token = localStorage.getItem('token');
      try {
        const base64Url = token?.split('.')[1]; // Get the payload part
        const base64 = base64Url?.replace(/-/g, '+').replace(/_/g, '/'); // Convert Base64Url to standard Base64
        const decodedPayload = JSON.parse(atob(base64));
        setSelectedUser([decodedPayload?.sub]);
      } catch (error) {
        console.error("Error decoding JWT:", error);
      }
    }, [!setSelectedUser])

  return (
    <SelectedUserQuarterContext.Provider
      value={{
        selectedUser,
        setSelectedUser,
        selectedQuarter,
        setSelectedQuarter,
        selectedSingleUser,
        setSelectedSingleUser,
        singleQuarter,
        setSingleQuarter,
        dashboardType,
        setDashboardType
      }}
    >
      {children}
    </SelectedUserQuarterContext.Provider>
  );
};

export const useSelectedUserQuarter = () => {
  const context = useContext(SelectedUserQuarterContext);
  if (!context) {
    throw new Error(
      "useSelectedUserQuarter must be used within a SelectedUserQuarterProvider"
    );
  }
  return context;
};
