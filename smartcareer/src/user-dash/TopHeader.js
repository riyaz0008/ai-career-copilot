import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const TopHeader = ({ firstName }) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
 const [notificationCount, setNotificationCount] = useState(0);

useEffect(() => {
    const fetchNotificationCount = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));

            if (!user?._id) return;

            const response = await api.get(
    `/api/notifications/unread-count/${user._id}`
);

            if (response.data.status === 1) {
                setNotificationCount(response.data.count);
            }
        } catch (error) {
            console.log("Notification count error:", error);
        }
    };

    fetchNotificationCount();
}, []);

  return (
    <header className="bg-slate-950/90 backdrop-blur-2xl border-b border-slate-800/80 px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
      {/* Left Side */}
      <div>
        <h2 className="text-lg font-extrabold text-white tracking-tight">
          Dashboard
        </h2>

        <p className="text-xs text-indigo-400 mt-0.5 font-medium">
          Your personalized career journey
        </p>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <Link
          to="/notifications"
          className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800/80 hover:bg-slate-800 text-slate-300 transition"
        >
          <span className="text-lg">🔔</span>

{notificationCount > 0 && (
    <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[10px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
        {notificationCount > 99 ? "99+" : notificationCount}
    </span>
)}
        </Link>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-800"></div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800/80 hover:bg-slate-800 transition"
          >
            {/* Avatar */}
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md shadow-indigo-600/25 text-sm">
              {firstName.charAt(0).toUpperCase()}
            </div>

            {/* User Details */}
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-white leading-tight">
                {firstName}
              </p>

              <p className="text-xs text-indigo-400 font-medium">
                Career Explorer
              </p>
            </div>

            {/* Dropdown Arrow */}
            <span
              className={`text-slate-400 text-xs transition-transform duration-200 ${
                profileMenuOpen ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </button>

          {/* Profile Dropdown */}
          {profileMenuOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800/80 overflow-hidden backdrop-blur-2xl z-50">
              {/* Profile Header */}
              <div className="bg-slate-900/90 px-5 py-5 border-b border-slate-800/80">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-2xl flex items-center justify-center text-lg font-bold shadow-lg shadow-indigo-600/25">
                    {firstName.charAt(0).toUpperCase()}
                  </div>

                  <div className="text-white">
                    <p className="font-bold text-base">
                      {firstName}
                    </p>

                    <p className="text-xs text-indigo-400 mt-0.5 font-medium">
                      Career Explorer
                    </p>
                  </div>
                </div>
              </div>

              {/* Dropdown Options */}
              <div className="p-2 space-y-1">
                {/* Profile */}
                <Link
                  to="/my-profile"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
                >
                  <div className="w-9 h-9 bg-slate-950 border border-slate-800 text-indigo-400 rounded-xl flex items-center justify-center">
                    👤
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      My Profile
                    </p>

                    <p className="text-xs text-slate-400">
                      View and edit your profile
                    </p>
                  </div>
                </Link>

                {/* Settings */}
                <Link
                  to="/settings"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
                >
                  <div className="w-9 h-9 bg-slate-950 border border-slate-800 text-violet-400 rounded-xl flex items-center justify-center">
                    ⚙️
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Settings
                    </p>

                    <p className="text-xs text-slate-400">
                      Manage account preferences
                    </p>
                  </div>
                </Link>

                {/* Notifications */}
                <Link
                  to="/notifications"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
                >
                  <div className="w-9 h-9 bg-slate-950 border border-slate-800 text-indigo-400 rounded-xl flex items-center justify-center">
                    🔔
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Notifications
                    </p>

                    <p className="text-xs text-slate-400">
                      Check your latest updates
                    </p>
                  </div>
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-slate-800/80 p-2">
                <Link
                  to="/login"
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-500/10 text-rose-400 transition"
                >
                  <div className="w-9 h-9 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center">
                    🚪
                  </div>

                  <div className="text-left">
                    <p className="text-sm font-semibold">
                      Logout
                    </p>

                    <p className="text-xs text-rose-400/70">
                      Sign out from your account
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopHeader;