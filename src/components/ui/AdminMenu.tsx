import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown, KeyRound } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
interface AdminMenuProps {
  user: any;
}
const AdminMenu: React.FC<AdminMenuProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const {  logout } = useAuth();
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);


  const getInitials = (username: string) => {
    if (!username) return "";
    const nameParts = username.split(" ");
    const firstInitial = nameParts[0]?.[0] || "";
    const lastInitial = nameParts.length > 1 ? nameParts[1]?.[0] || "" : ""; // First letter of last name
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };


  return (
    <div className="relative flex items-center gap-2 text-white">
      {user?.profile_photo ? (
        <img
          src={user.profile_photo}
          alt="Profile"
          className="w-[36px] h-[36px] mr-2 ml-[-12px] rounded-full object-cover"
        />
      ) : (
        <div className="text-center text-sm font-medium flex items-center justify-center p-2 size-9 rounded-full border-2 border-[#4F4F4F] cursor-pointer bg-[#2c2c2c]">
          {getInitials(user?.name || "")}
        </div>
      )}
      <span className="text-base">{user?.name}</span>
  
      {/* Toggle button */}
      <button
       onClick={() => setIsOpen(!isOpen)}
        className="focus:outline-none ml-1 p-2 hover:bg-[#ffffff] hover:text-black rounded-lg"
      >
        <ChevronDown
          className={`size-6 transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>
  
      {/* Dropdown */}
      {isOpen && (
          <div className="absolute top-10 right-4 w-48 py-2 bg-zinc-800 rounded-md shadow-xl z-20">
            <button
              onClick={() => {
                // setIsUserSettingsOpen(true);
                setIsOpen(false);
              }}
              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700 w-full text-left"
            >
              <KeyRound size={16} className="mr-2" />
              User Settings
            </button>
            <button
              onClick={() => {
                logout();
                localStorage.setItem("selectedKpiType", "individual");
                setIsOpen(false);
              }}
              className="block px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700 w-full text-left"
            >
              Logout
            </button>
            <Link to={"/select-organization"}>
              <button className="block px-4 py-2 text-sm text-gray-300 hover:bg-zinc-700 w-full text-left">
                Switch Organization
              </button>
            </Link>
          </div>
        )}
    </div>
  );
};

export default AdminMenu;
