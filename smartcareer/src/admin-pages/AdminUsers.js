import React, { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [editUser, setEditUser] = useState(null);
    const [deleteUser, setDeleteUser] = useState(null);
    const [saving, setSaving] = useState(false);

    const getUsers = async () => {
        try {
            const response = await api.get("/api/admin/users");

            if (response.data.status === 1) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.log(error);
            alert("Users data fetch failed");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUsers();
    }, []);

    const handleEdit = (user) => {
        setEditUser({
            ...user,
            skills: user.skills || "",
            goal: user.goal || "",
            status: user.status || "active"
        });
    };

    const handleEditChange = (e) => {
        setEditUser({
            ...editUser,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await api.put(
                `/api/admin/users/${editUser._id}`,
                {
                    firstname: editUser.firstname,
                    lastname: editUser.lastname,
                    email: editUser.email,
                    education: editUser.education,
                    career: editUser.career,
                    skills: editUser.skills,
                    goal: editUser.goal,
                    status: editUser.status
                }
            );

            if (response.data.status === 1) {
                await getUsers();
                setEditUser(null);
                alert("User updated successfully");
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.log(error);
            alert("User update failed");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await api.delete(
                `/api/admin/users/${deleteUser._id}`
            );

            if (response.data.status === 1) {
                setUsers(
                    users.filter(
                        (user) => user._id !== deleteUser._id
                    )
                );

                setDeleteUser(null);
                alert("User deleted successfully");
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.log(error);
            alert("User delete failed");
        }
    };

    const filteredUsers = users.filter((user) => {
        const searchText = search.toLowerCase();

        return (
            `${user.firstname} ${user.lastname}`
                .toLowerCase()
                .includes(searchText) ||
            user.email?.toLowerCase().includes(searchText) ||
            user.career?.toLowerCase().includes(searchText) ||
            user.education?.toLowerCase().includes(searchText)
        );
    });

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
            <header className="bg-slate-900/90 backdrop-blur-2xl border-b border-slate-800/80">
                <div className="max-w-7xl mx-auto px-6 md:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30">
                                👥
                            </div>

                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                                    Manage Users
                                </h1>

                                <p className="text-sm text-slate-400 mt-1">
                                    Manage registered users and account status.
                                </p>
                            </div>
                        </div>

                        <Link
                            to="/admin-dashboard"
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900 text-slate-300 font-bold text-sm hover:bg-slate-800 hover:text-indigo-400 hover:border-indigo-500/40 transition shadow-sm w-fit"
                        >
                            <span>←</span>
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 md:px-8 py-8">

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

                    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Total Users
                        </p>

                        <div className="flex items-center justify-between mt-3">
                            <h2 className="text-3xl font-black text-white">
                                {users.length}
                            </h2>

                            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-lg">
                                👥
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Active Users
                        </p>

                        <div className="flex items-center justify-between mt-3">
                            <h2 className="text-3xl font-black text-emerald-400">
                                {
                                    users.filter(
                                        (user) =>
                                            user.status === "active" ||
                                            !user.status
                                    ).length
                                }
                            </h2>

                            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                                ✓
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 shadow-xl">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Inactive Users
                        </p>

                        <div className="flex items-center justify-between mt-3">
                            <h2 className="text-3xl font-black text-rose-400">
                                {
                                    users.filter(
                                        (user) =>
                                            user.status === "inactive"
                                    ).length
                                }
                            </h2>

                            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold">
                                !
                            </div>
                        </div>
                    </div>

                </div>

                <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden relative">

                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                    <div className="px-6 md:px-8 py-6 border-b border-slate-800/80">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">
                                    User Directory
                                </h2>

                                <p className="text-sm text-slate-400 mt-1">
                                    Review and manage registered accounts.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                        ⌕
                                    </span>

                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        className="w-full sm:w-72 pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm font-medium text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition"
                                    />
                                </div>

                                <span className="px-3.5 py-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold tracking-wide uppercase text-center">
                                    {filteredUsers.length} Users
                                </span>

                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-16 text-center">
                            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>

                            <p className="text-slate-400 mt-4 text-sm font-medium">
                                Loading Users...
                            </p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-16 text-center">

                            <div className="w-20 h-20 mx-auto bg-slate-800/80 border border-slate-700/60 rounded-3xl flex items-center justify-center text-4xl mb-4">
                                👥
                            </div>

                            <h3 className="text-lg font-bold text-white">
                                No Users Found
                            </h3>

                            <p className="text-slate-400 mt-1 text-sm">
                                Try searching with a different name, email,
                                career or education.
                            </p>

                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">

                                <thead className="bg-slate-950/70 border-b border-slate-800/80">
                                    <tr>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                                            User
                                        </th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                                            Email
                                        </th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                                            Education
                                        </th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                                            Career
                                        </th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
                                            Status
                                        </th>

                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
                                            Actions
                                        </th>

                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-800/80">

                                    {filteredUsers.map((user) => (
                                        <tr
                                            key={user._id}
                                            className="hover:bg-slate-800/40 transition"
                                        >

                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">

                                                    <div className="w-11 h-11 shrink-0 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                                                        {user.firstname
                                                            ?.charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <div>
                                                        <p className="font-bold text-white">
                                                            {user.firstname}{" "}
                                                            {user.lastname}
                                                        </p>

                                                        <p className="text-xs text-slate-500 mt-1">
                                                            Account
                                                        </p>
                                                    </div>

                                                </div>
                                            </td>

                                            <td className="px-6 py-5 text-sm text-slate-300">
                                                {user.email}
                                            </td>

                                            <td className="px-6 py-5 text-sm text-slate-300">
                                                {user.education || "-"}
                                            </td>

                                            <td className="px-6 py-5 text-sm text-slate-300">
                                                {user.career || "-"}
                                            </td>

                                            <td className="px-6 py-5 text-center">

                                                {user.status === "inactive" ? (
                                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                                        Inactive
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                        Active
                                                    </span>
                                                )}

                                            </td>

                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-center gap-2">

                                                    <button
                                                        onClick={() =>
                                                            handleEdit(user)
                                                        }
                                                        className="px-4 py-2 border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 rounded-xl text-xs font-bold hover:bg-indigo-500/20 transition shadow-sm"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            setDeleteUser(user)
                                                        }
                                                        className="px-4 py-2 border border-rose-500/30 bg-rose-500/10 text-rose-300 rounded-xl text-xs font-bold hover:bg-rose-500/20 transition shadow-sm"
                                                    >
                                                        Delete
                                                    </button>

                                                </div>
                                            </td>

                                        </tr>
                                    ))}

                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {editUser && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">

                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 relative">

                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-800/80">

                            <div>
                                <h2 className="text-xl font-black text-white tracking-tight">
                                    Edit User
                                </h2>

                                <p className="text-xs text-slate-400 mt-0.5">
                                    Update user information and account status.
                                </p>
                            </div>

                            <button
                                onClick={() => setEditUser(null)}
                                className="text-slate-400 hover:text-white text-2xl font-bold transition"
                            >
                                ×
                            </button>

                        </div>

                        <form
                            onSubmit={handleUpdate}
                            className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-left"
                        >

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    First Name
                                </label>

                                <input
                                    type="text"
                                    name="firstname"
                                    value={editUser.firstname || ""}
                                    onChange={handleEditChange}
                                    required
                                    className="w-full px-4 py-3.5 border border-slate-700/80 bg-slate-950 rounded-xl text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Last Name
                                </label>

                                <input
                                    type="text"
                                    name="lastname"
                                    value={editUser.lastname || ""}
                                    onChange={handleEditChange}
                                    required
                                    className="w-full px-4 py-3.5 border border-slate-700/80 bg-slate-950 rounded-xl text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={editUser.email || ""}
                                    onChange={handleEditChange}
                                    required
                                    className="w-full px-4 py-3.5 border border-slate-700/80 bg-slate-950 rounded-xl text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Education
                                </label>

                                <input
                                    type="text"
                                    name="education"
                                    value={editUser.education || ""}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-3.5 border border-slate-700/80 bg-slate-950 rounded-xl text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Career
                                </label>

                                <input
                                    type="text"
                                    name="career"
                                    value={editUser.career || ""}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-3.5 border border-slate-700/80 bg-slate-950 rounded-xl text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Skills
                                </label>

                                <input
                                    type="text"
                                    name="skills"
                                    value={editUser.skills || ""}
                                    onChange={handleEditChange}
                                    placeholder="HTML, CSS, JavaScript..."
                                    className="w-full px-4 py-3.5 border border-slate-700/80 bg-slate-950 rounded-xl text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Career Goal
                                </label>

                                <textarea
                                    name="goal"
                                    value={editUser.goal || ""}
                                    onChange={handleEditChange}
                                    rows="3"
                                    className="w-full px-4 py-3.5 border border-slate-700/80 bg-slate-950 rounded-xl text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner resize-none"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Account Status
                                </label>

                                <select
                                    name="status"
                                    value={editUser.status || "active"}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-3.5 border border-slate-700/80 bg-slate-950 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm shadow-inner"
                                >
                                    <option value="active">
                                        Active
                                    </option>

                                    <option value="inactive">
                                        Inactive
                                    </option>
                                </select>

                                <p className="text-xs text-slate-500 mt-2">
                                    Inactive users will not be allowed to log in.
                                </p>
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-800/80">

                                <button
                                    type="button"
                                    onClick={() => setEditUser(null)}
                                    className="px-6 py-3 border border-slate-700 bg-slate-800/60 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-800 hover:text-white transition"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>

                            </div>

                        </form>
                    </div>
                </div>
            )}

            {deleteUser && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">

                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-7 shadow-2xl relative overflow-hidden">

                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 via-pink-500 to-red-500"></div>

                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-xl font-bold mb-5">
                            !
                        </div>

                        <h2 className="text-xl font-black text-white">
                            Delete User?
                        </h2>

                        <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                            Are you sure you want to delete{" "}
                            <span className="text-white font-bold">
                                {deleteUser.firstname}{" "}
                                {deleteUser.lastname}
                            </span>
                            ? This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-3 mt-7">

                            <button
                                onClick={() => setDeleteUser(null)}
                                className="px-6 py-3 border border-slate-700 bg-slate-800/60 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-800 hover:text-white transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDelete}
                                className="px-6 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/20 transition"
                            >
                                Delete User
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;