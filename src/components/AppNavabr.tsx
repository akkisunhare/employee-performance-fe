import { useAuth } from "@/contexts/AuthContext";
import NavHeaderComponent from "./ui/NavHeaderComponent";

export default function AppNavbar() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <header className="flex items-center justify-between w-full py-4 px-2 bg-black text-white">
      {/* <div className="flex items-center gap-2">
        <span className="text-xl font-medium">Hi, {user.name}</span>
      </div> */}
      <NavHeaderComponent user = {user}/>

      {/* <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-300">
            <div className="w-full h-full flex items-center justify-center text-black font-medium">
              {user.name[0]}
            </div>
          </div>
          <span className="font-medium">{user.name}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div> */}
    </header>
  );
}
