import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000"
});

api.interceptors.request.use(
    (config) => {
        const path = window.location.pathname;

        let token = null;

        if (path.startsWith("/admin")) {
            token = localStorage.getItem("adminToken");
        } else if (path.startsWith("/company")) {
            token = localStorage.getItem("companyToken");
        } else {
            token = localStorage.getItem("token");
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            delete config.headers.Authorization;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

export default api;