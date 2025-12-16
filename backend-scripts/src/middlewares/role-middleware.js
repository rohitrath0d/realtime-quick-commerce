// What Operations Are Happening Here?
// Line by line:
// Line	Operation type
// req.user	In-memory object access
// req.user.role	In-memory read
// allowedRoles.includes(...)	Synchronous array lookup
// res.status().json()	Synchronous response send
// next()	Synchronous call

export const authorizeRole = (allowedRoles) => {
  // Support both array and spread arguments
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // Case-insensitive role comparison
    const userRole = req.user.role.toUpperCase();
    const normalizedRoles = roles.map(r => r.toUpperCase());

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: insufficient permissions",
      });
    }

    next();
  };
};