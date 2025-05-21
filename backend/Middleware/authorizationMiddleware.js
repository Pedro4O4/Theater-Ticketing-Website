module.exports = (requiredRole) => {
    return (req, res, next) => {

        if (!requiredRole.includes(req.user.role)) {
            return res.status(403).json({ message: "hi denied" });
        }
        next();
    };
};