import jwt from "jsonwebtoken";

export const protectAuth = (req, res, next) => {
  let token;

  // Expecting: Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded user info to request
    req.user = decoded; // { id, role }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Token is invalid or expired",
    });
  }
};
