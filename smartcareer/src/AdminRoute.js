import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
    const adminToken = localStorage.getItem("adminToken");

    if (!adminToken) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default AdminRoute;