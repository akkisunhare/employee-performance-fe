// import RolesPermissionsTable from "@/components/RolesPermissionsTable";
import { useState } from "react";

const Settings = () => {
  const [activeButton, setActiveButton] = useState(null);
  const [activeBtn, ] = useState(null);

  const handleButtonClick = (buttonName: any) => {
    setActiveButton(buttonName);
  };

  // Dummy data for table rows


  return (
    <div className="w-full mx-auto">
      <div className="flex justify-between items-center rounded-lg p-4 bg-[#222222]">
        <h1 className="text-2xl text-[#FFFFFF] font-normal">Settings</h1>
      </div>

      <div className="w-[29.75rem] px-4 py-2.5 bg-[#121212] flex gap-3 mt-5 rounded-lg">
        <button
          className={`text-[#D7D7D7] p-2 rounded transition duration-200 ease-in-out group ${
            activeButton === "individual"
              ? "bg-[#FFFFFF] text-[#000000]"
              : "hover:bg-[#FFFFFF] hover:text-[#000000]"
          }`}
          onClick={() => handleButtonClick("individual")}
        >
          <span
            className={`group-hover:text-[#000000] ${
              activeButton === "individual" ? "text-[#000000]" : ""
            }`}
          >
            Individual Priorities
          </span>
        </button>

        <button
          className={`text-[#D7D7D7] p-2 rounded transition duration-200 ease-in-out group ${
            activeButton === "team"
              ? "bg-[#FFFFFF] text-[#000000]"
              : "hover:bg-[#FFFFFF] hover:text-[#000000]"
          }`}
          onClick={() => handleButtonClick("team")}
        >
          <span
            className={`group-hover:text-[#000000] ${
              activeButton === "team" ? "text-[#000000]" : ""
            }`}
          >
            Team Priorities
          </span>
        </button>

        <button
          className={`text-[#D7D7D7] hover:bg-[#FFFFFF] hover:text-[#000000] focus:text-[#000000] p-2 rounded transition duration-200 ease-in-out ${
            activeButton === "company" && "text-[#000000] bg-[#FFFFFF] "
          }`}
          onClick={() => handleButtonClick("company")}
        >
          <span
            className={`group-hover:text-[#000000] ${
              activeButton === "company" ? "text-[#000000]" : ""
            }`}
          >
            Company Priorities
          </span>
        </button>
      </div>

      <div className="mt-5 bg-[#09090B]">
      
        {/* <RolesPermissionsTable rolesData={rolesData} /> */}
      </div>

      <div className="mt-5 gap-3 flex">
        <button
          className={`py-3 px-16 text-base font-normal border-1 rounded-2xl cursor-pointer  transition duration-200 ease-in-out  ${
            activeBtn === "cancel"
              ? "bg-[#FFFFFF] text-[#000000]"
              : "border-[#D6D6D6] text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#000000]"
          }`}
        //   onClick={() => setActiveBtn("cancel")}
        >
          <span
            className={`group-hover:text-[#000000] ${
              activeBtn === "cancel" ? "text-[#000000]" : ""
            }`}
          >
            Cancel
          </span>
        </button>
        <button
          className={`py-3 px-18 text-base font-normal border-1  rounded-2xl cursor-pointer   transition duration-200 ease-in-out  ${
            activeBtn === "save"
              ? "bg-[#FFFFFF] text-[#000000]"
              : "border-[#D6D6D6] text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#000000]"
          }`}
        //   onClick={() => setActiveBtn("save")}
        >
          <span
            className={`group-hover:text-[#000000] ${
              activeBtn === "save" ? "text-[#000000]" : ""
            }`}
          >
            Save
          </span>
        </button>
      </div>
    </div>
  );
};

export default Settings;
