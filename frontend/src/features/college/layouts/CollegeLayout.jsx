import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import CollegeNavbar from "../navbar/components/navbar";
import CollegeSidebar from "../components/CollegeSidebar";
import MobileSidebar from "../dashboard/components/layout/MobileSidebar";
import CollegeFooter from "../components/CollegeFooter";

const CollegeLayout = () => {
  // Sidebar Toggle
  const [openSidebar, setOpenSidebar] = useState(false);

  // Dark Mode
  const [darkMode, setDarkMode] = useState(true);

  const location = useLocation();

  if (location.pathname === "/college/add-profile") {
    return (
      <div className={`min-h-screen transition-all duration-300 flex items-center justify-center ${
        darkMode ? "bg-[#1A1A1A] text-white" : "bg-slate-100 text-black"
      }`}>
        <div className="w-full max-w-4xl p-6">
          <Outlet context={{ darkMode }} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        darkMode ? "bg-[#1A1A1A] text-white" : "bg-slate-100 text-[#2D3436]"
      }`}
    >
      {/* Navbar */}
      <CollegeNavbar
        openSidebar={openSidebar}
        setOpenSidebar={setOpenSidebar}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <CollegeSidebar
            openSidebar={openSidebar}
            setOpenSidebar={setOpenSidebar}
            darkMode={darkMode}
          />
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar
          openSidebar={openSidebar}
          setOpenSidebar={setOpenSidebar}
          darkMode={darkMode}
        />

        {/* Main Section */}
        <div className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
          {/* Page Content */}
          <main className="flex-1 pt-20 p-6 overflow-y-auto">
            <Outlet
              context={{
                darkMode,
              }}
            />
          </main>

          {/* Footer */}
          <CollegeFooter darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
};

export default CollegeLayout;
