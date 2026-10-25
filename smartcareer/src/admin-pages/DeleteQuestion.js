import React from "react";
import api from "../api";

const DeleteQuestion = ({ question, onClose, onSuccess }) => {
    const handleDelete = async () => {
        try {
            const response = await api.delete(`/api/admin/assessment-question/${question._id}`);
            if (response.data.status === 1) {
                alert("Question deleted successfully!");
                onSuccess();
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.log("Delete Question Error:", error);
            alert("Something went wrong.");
        }
    };
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl text-slate-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500"></div>
                <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-inner">
                    !
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">Delete Question?</h2>
                <p className="text-slate-400 mt-1.5 text-sm leading-relaxed">Are you sure you want to delete this assessment question?</p>
                <div className="mt-5 bg-slate-950 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-300 font-medium shadow-inner">
                    {question.question}
                </div>
                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className="px-6 py-3 border border-slate-700 bg-slate-800/60 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-800 hover:text-white transition">
                        Cancel
                    </button>
                    <button onClick={handleDelete} className="px-6 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 transition">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteQuestion;