const jwt = require("jsonwebtoken");

const authMiddleware = (requiredRole = null) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({
          message: "Access denied. No token provided or invalid format.",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach user info to request

      // If a specific role is required, check it
      if (requiredRole && req.user.role !== requiredRole) {
        return res
          .status(403)
          .json({
            message: `Access denied. Only ${requiredRole}s are allowed.`,
          });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
  };
};

module.exports = authMiddleware;
