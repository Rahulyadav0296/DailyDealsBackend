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
} = require("../controllers/auth");

router.route("/signin").post(validateSignInRequest, isRequestValidated, signIn);
router.route("/signup").post(validateSignUpRequest, isRequestValidated, signUp);
router.get("/signup/:id", getUser);
router.put("/signup/:id", editUser);
router.delete("/signup/:id", deleteUser);

module.exports = router;
