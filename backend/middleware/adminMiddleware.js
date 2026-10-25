const adminMiddleware = (req, res, next) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admin permission required.",
                status: 0
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            message: "Admin authorization failed.",
            status: 0
        });
    }
};

export default adminMiddleware;