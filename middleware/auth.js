const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "No token, authorization denied" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized" });
    }

    req.user = decoded;
    next();
  });
};

const adminAuth = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: "Admin Resources Only" });
  }
  next();
};

module.exports = { verifyToken, adminAuth };
