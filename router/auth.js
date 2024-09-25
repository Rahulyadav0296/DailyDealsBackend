const express = require("express");
const router = express.Router();
const {
  isRequestValidated,
  validateSignInRequest,
  validateSignUpRequest,
} = require("../validator/auth");
const {
  signUp,
  signIn,
  getUser,
  editUser,
  deleteUser,
  getAllUser,
} = require("../controllers/auth");
const { verifyToken, adminAuth } = require("../middleware/auth");

router.route("/signin").post(validateSignInRequest, isRequestValidated, signIn);
router.route("/signup").post(validateSignUpRequest, isRequestValidated, signUp);
router.get("/users/:id", verifyToken, getUser);
router.put("/signup/:id", verifyToken, editUser);
router.delete("/signup/:id", verifyToken, adminAuth, deleteUser);
router.get("/users", verifyToken, adminAuth, getAllUser);
module.exports = router;
