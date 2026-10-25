import React, { useState, useEffect } from "react";
import api from '../api'
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import DashboardBody from "./DashboardBody";

const UserDashboard = () => {
  const [profileCompletion, setProfileCompletion] = useState(80);
  const [dbUser, setDbUser] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser && storedUser._id) {
        try {
          // Seedha Backend API se latest user data mangwana
 const response = await api.put(
    `/api/get-user/${storedUser._id}`
);

          if (response.data.status == 1) {
            const user = response.data.data;
            setDbUser(user);

            // API ke data ke basis par 80%, 90%, ya 100% check karna
            let score = 80;
            if (user.skills && user.skills.trim() !== "") {
              score += 10;
            }
            if (user.goal && user.goal.trim() !== "") {
              score += 10;
            }
            setProfileCompletion(score);
          }
        } catch (err) {
          console.log(err.message);
        }
      }
    };

    fetchUserData();
  }, []);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const firstName = dbUser.firstname || user.firstname || "User";

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* 1. Left Sidebar */}
      <Sidebar />

      {/* 2. Main Area (Top Header + Dashboard Body) */}
      <main className="flex-1 md:ml-64">
        <TopHeader firstName={firstName} />
        <DashboardBody
          firstName={firstName}
          profileCompletion={profileCompletion}
        />
      </main>
    </div>
  );
};

export default UserDashboard;