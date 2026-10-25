import React from "react";
import { Navigate } from "react-router-dom";

const CompanyRoute = ({ children }) => {
    const companyToken = localStorage.getItem("companyToken");

    if (!companyToken) {
        return <Navigate to="/company-login" replace />;
    }

    return children;
};

export default CompanyRoute;