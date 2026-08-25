// Checks req.user.role (set by authMiddleware from the JWT payload) against
// the roles allowed to hit this route. Use after authMiddleware.
export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ success: false, error: "Access denied. Insufficient permissions." });
  }
  next();
};
