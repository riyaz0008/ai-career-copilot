import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CompanySidebar from "./CompanySidebar";
import CompanyTopHeader from "./CompanyTopHeader";
import CompanyDashboardBody from "./CompanyDashboardBody";

const CompanyDashboard = () => {
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCompany = () => {
            const savedCompany = localStorage.getItem("company");
            const token = localStorage.getItem("companyToken");

            if (!savedCompany || !token) {
                navigate("/company-login", { replace: true });
                return;
            }

            try {
                const parsedCompany = JSON.parse(savedCompany);
                setCompany(parsedCompany);
            } catch (error) {
                localStorage.removeItem("company");
                localStorage.removeItem("companyToken");
                navigate("/company-login", { replace: true });
                return;
            } finally {
                setLoading(false);
            }
        };

        loadCompany();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                    <p className="text-slate-400">Loading company dashboard...</p>
                </div>
            </div>
        );
    }

    if (!company) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-slate-950">
            <CompanySidebar />

            <main className="min-w-0 flex-1 md:ml-64">
                <CompanyTopHeader company={company} />
                <CompanyDashboardBody company={company} />
            </main>
        </div>
    );
};

export default CompanyDashboard;