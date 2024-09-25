const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

const verifyToken = (req, res, next) => {
  console.log("Cookies: ", req.cookies);
  console.log("Authorization Header: ", req.headers.authorization);

  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  console.log("Verified Token is: ", token);
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

    console.log("Decoded user info: ", decoded);
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
