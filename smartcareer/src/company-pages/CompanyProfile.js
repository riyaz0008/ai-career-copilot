
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const CompanyProfile = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    description: "",
  });

  const [verificationStatus, setVerificationStatus] = useState("pending");

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const response = await api.get("/api/company/profile");

        if (response.data.status === 1) {
          const company = response.data.data;

          setFormData({
            companyName: company.companyName || "",
            contactName: company.contactName || "",
            email: company.email || "",
            phone: company.phone || "",
            website: company.website || "",
            description: company.description || "",
          });

          setVerificationStatus(company.verificationStatus || "pending");

          localStorage.setItem("company", JSON.stringify(company));
        }
      } catch (error) {
        console.error(
          "Fetch Company Profile Error:",
          error.response?.data?.message || error.message
        );

        alert(
          error.response?.data?.message ||
          "Unable to load company profile. Please log in again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const calculateCompletion = () => {
    const fields = [
      "companyName",
      "contactName",
      "email",
      "phone",
      "website",
      "description",
    ];

    const completedFields = fields.filter(
      (field) => formData[field].trim() !== ""
    ).length;

    return Math.round((completedFields / fields.length) * 100);
  };

  const completionPercentage = calculateCompletion();

  const initials = formData.companyName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase() || "CO";

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      const response = await api.put(
        "/api/company/profile",
        formData
      );

      if (response.data.status === 1) {
        const company = response.data.data;

        setFormData({
          companyName: company.companyName || "",
          contactName: company.contactName || "",
          email: company.email || "",
          phone: company.phone || "",
          website: company.website || "",
          description: company.description || "",
        });

        setVerificationStatus(
          company.verificationStatus || "pending"
        );

        localStorage.setItem("company", JSON.stringify(company));

        alert(response.data.message);
      } else {
        alert(response.data.message || "Profile update failed.");
      }
    } catch (error) {
      console.error(
        "Update Company Profile Error:",
        error.response?.data?.message || error.message
      );

      alert(
        error.response?.data?.message ||
        "Unable to update company profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full border border-slate-700/80 bg-slate-950 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm shadow-inner transition";

  const labelClass =
    "block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2";

  const statusStyles = {
    approved: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    rejected: "bg-red-500/10 text-red-300 border-red-500/20",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">
            Loading company profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-8 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Profile Header */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

          <div className="h-36 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-slate-800/80"></div>

          <div className="px-6 sm:px-8 pb-8">
            <div className="relative flex flex-col sm:flex-row items-center sm:items-end sm:space-x-6 -mt-16">

              <div className="w-28 h-28 shrink-0 rounded-3xl border-4 border-slate-900 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-3xl font-black shadow-xl shadow-indigo-500/20">
                {initials}
              </div>

              <div className="mt-4 sm:mt-0 text-center sm:text-left flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight break-words">
                  {formData.companyName || "Company Profile"}
                </h1>

                <p className="text-sm text-slate-400 mt-1 break-all">
                  {formData.email}
                </p>

                <p className="text-sm text-slate-400 mt-1">
                  Contact: {formData.contactName || "Not provided"}
                </p>
              </div>

              <div className="mt-4 sm:mt-0">
                <span
                  className={`inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border ${
                    statusStyles[verificationStatus] ||
                    statusStyles.pending
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {verificationStatus.charAt(0).toUpperCase() +
                    verificationStatus.slice(1)}
                </span>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="mt-8 pt-6 border-t border-slate-800/80">
              <div className="flex flex-wrap justify-between gap-2 text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                <span>Profile Completion</span>

                <span
                  className={
                    completionPercentage === 100
                      ? "text-emerald-400 font-black text-sm"
                      : "text-indigo-400 font-black text-sm"
                  }
                >
                  {completionPercentage}%
                </span>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/50">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    completionPercentage === 100
                      ? "bg-emerald-500"
                      : "bg-gradient-to-r from-indigo-500 to-violet-500"
                  }`}
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>

              <p className="text-xs text-slate-500 mt-2">
                Complete your company details to build a professional profile.
              </p>
            </div>
          </div>
        </div>

        {/* Company Profile Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/85 rounded-3xl shadow-2xl p-6 sm:p-10 relative overflow-hidden"
        >
          {/* Company Information */}
          <div className="mb-10">
            <h2 className="text-lg font-extrabold text-white border-b border-slate-800 pb-3 mb-6 text-left tracking-tight flex items-center gap-2">
              <span>🏢</span>
              Company Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">

              <div>
                <label className={labelClass}>
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  Contact Person / HR Name
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter contact person name"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  Company Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="company@example.com"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter contact number"
                />
              </div>

            </div>
          </div>

          {/* Contact Details */}
          <div className="mb-10">
            <h2 className="text-lg font-extrabold text-white border-b border-slate-800 pb-3 mb-6 text-left tracking-tight flex items-center gap-2">
              <span>🌐</span>
              Online Presence
            </h2>

            <div className="text-left">
              <label className={labelClass}>
                Company Website
              </label>

              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className={inputClass}
                placeholder="https://www.example.com"
              />
            </div>
          </div>

          {/* About Company */}
          <div>
            <h2 className="text-lg font-extrabold text-white border-b border-slate-800 pb-3 mb-6 text-left tracking-tight flex items-center gap-2">
              <span>📝</span>
              About the Company
            </h2>

            <div className="text-left">
              <label className={labelClass}>
                Company Description
              </label>

              <textarea
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleChange}
                className={`${inputClass} resize-y`}
                placeholder="Describe your company, its work, team and opportunities..."
              ></textarea>

              <p className="text-xs text-slate-500 mt-2">
                This information helps applicants learn about your company.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-10 pt-6 border-t border-slate-800/85 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/company-dashboard")}
              className="w-full sm:w-auto bg-slate-800/80 text-slate-300 border border-slate-700 px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-800 hover:text-white transition shadow-sm text-center"
            >
              ← Back to Dashboard
            </button>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 transition transform hover:-translate-y-0.5 text-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfile;
