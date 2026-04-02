// New Optimize Code 07-08-2025 With all fixes
import React, { useEffect, useState, useCallback } from "react";
import { QuarterService } from "@/services/quaterService";
import { useSelectedUserQuarter } from "@/contexts/SelectedUserQuarterContext";
import { useLocation } from "react-router-dom";
import SingleUserSelect from "./singleSelectDropdown";
import SingleSelectQuarter from "./singleSelectQuarter";
import { UserService } from "@/services/users";

interface NavHeaderComponentProps {
  user: any;
}

const NavHeaderComponent: React.FC<NavHeaderComponentProps> = ({ user }) => {
  const [quarterResponse, setQuarterResponse] = useState<any[]>([]);
  const [userResponse, setUserResponse] = useState<any[]>([]);
  const [hasFetchedQuarters, setHasFetchedQuarters] = useState(false);
  const [isInitialUserSet, setIsInitialUserSet] = useState(false);

  const {
    selectedSingleUser,
    setSelectedSingleUser,
    singleQuarter,
    setSingleQuarter,
    dashboardType,
  } = useSelectedUserQuarter();

  // Set initial user from token (runs only once)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isInitialUserSet) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedPayload = JSON.parse(atob(base64));
        setSelectedSingleUser(decodedPayload?.sub);
        setIsInitialUserSet(true);
      } catch (error) {
        console.error("Error decoding JWT:", error);
      }
    }
  }, [isInitialUserSet, setSelectedSingleUser]);

  // Memoized quarter data fetch function
  const quarterData = useCallback(async () => {
    if (hasFetchedQuarters) return;
    try {
      const yearStr = new Date().getFullYear().toString();
      const response: any = await QuarterService.getCurrentYearQuaters(yearStr);
      
      if (response?.data) {
        setQuarterResponse(response.data);
        setHasFetchedQuarters(true);
        
        const today = new Date();
        const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        let currentQuarterValue = '';
        for (const quarter of response.data) {
          const quarterStart = new Date(quarter.start_date);
          const quarterEnd = new Date(quarter.end_date);

          if (now >= quarterStart && now <= quarterEnd) {
            currentQuarterValue = `${quarter.quarter}-${quarter.year}`;
            break;
          }
        }

        if (currentQuarterValue && currentQuarterValue !== singleQuarter) {
          setSingleQuarter(currentQuarterValue);
        }
      }
    } catch (error) {
      console.error("Error fetching quarter data:", error);
    }
  }, [hasFetchedQuarters, singleQuarter, setSingleQuarter]);

  // Fetch quarters only once when component mounts
  useEffect(() => {
    quarterData();
  }, [quarterData]);

  // Fetch users when dashboardType changes or component mounts
  const fetchUsers = useCallback(async () => {
    try {
      const response = await UserService.getAllUsers({ role: user?.role });
      const users = response?.data || [];
      setUserResponse(users);
      
      // If selectedSingleUser is not set but we have users, set it to the first user
      if (!selectedSingleUser && users.length > 0) {
        setSelectedSingleUser(users[0]._id);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [user?.role, selectedSingleUser, setSelectedSingleUser]);

  useEffect(() => {
    fetchUsers();
  }, [dashboardType, fetchUsers]);

  const userDataSingle = (data: any) => {
    setSelectedSingleUser(data);
  };

  const path = useLocation();

  return (
    <div className="flex w-full py-2 justify-between items-center">
      <div className="flex text-2xl font-normal gap-2 text-[#FFFFFF]">
        Hi, <h1>{user?.name}</h1>
      </div>
      <div className="flex gap-5 items-center">
        {(path.pathname === "/dashboard" || path.pathname === "/kpis" || path.pathname === "/Priorities") && (
          <div className="flex gap-4">
            <div className="space-y-2 upper1">
              <SingleSelectQuarter
                userResponse={quarterResponse.map((q) => ({
                  _id: `${q.quarter}-${q.year}`,
                  name: `${q.quarter}-${q.year}`,
                }))}
                value={singleQuarter}
                onChange={(selected) => setSingleQuarter(selected)}
                placeholder="Select Quarter"
              />
            </div>
            {(path.pathname === "/dashboard" ? dashboardType === 'team' && user?.role !== "user" : user?.role !== "user") && (
              <div className="space-y-2 capital1">
                <SingleUserSelect
                  value={selectedSingleUser}
                  userResponse={userResponse}
                  onChange={userDataSingle}
                  placeholder="Select User"
                  labelField="name"
                  keyField="_id"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NavHeaderComponent;