export const checkRole = (allowedRoles = []) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    // Special case: college users need explicit permission
    if (req.path.startsWith("/api/college") && 
       userRole === "college" && 
       allowedRoles.includes("college")) {
      next();
      return;
    }

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to perform this action.",
        data: null,
      });
    }

    next();
  };
};

export default checkRole;