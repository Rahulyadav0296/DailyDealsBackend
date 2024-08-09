const { check, validationResult } = require("express-validator");
const { StatusCodes } = require("http-status-codes");

const validateSignUpRequest = [
  check("firstName").notEmpty().withMessage("First Name is Required"),
  check("lastName").notEmpty().withMessage("Last Name is Required"),
  check("username").notEmpty().withMessage("Username is Required"),
  check("email").isEmail().withMessage("Valid Email Required"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password Must be at least 6 characters Long"),
];

const validateSignInRequest = [
  check("email").isEmail().withMessage("Valid Email Required"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password Must be atleast 6 characters Long"),
];

const isRequestValidated = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.array().length > 0) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: errors.array()[0].msg });
  }
  next();
};

module.exports = {
  validateSignInRequest,
  validateSignUpRequest,
  isRequestValidated,
};
