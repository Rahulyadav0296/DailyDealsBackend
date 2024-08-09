const { StatusCodes } = require("http-status-codes");
const User = require("../models/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const signUp = async (req, res) => {
  const {
    firstName,
    lastName,
    username,
    email,
    password,
    profilePicture,
    contactNumber,
  } = req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !username ||
    !profilePicture ||
    !contactNumber
  ) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Please Provide Required Information",
    });
  }

  const hash_password = await bcrypt.hash(password, 10);

  const userData = {
    firstName,
    lastName,
    email,
    username,
    hash_password,
    profilePicture,
    contactNumber,
  };

  const user = await User.findOne({ email });
  if (user) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "User already registered",
    });
  } else {
    User.create(userData).then((data, err) => {
      if (err) res.status(StatusCodes.BAD_REQUEST).json({ err });
      else
        res
          .status(StatusCodes.CREATED)
          .json({ message: "User created Successfully", user: data });
    });
  }
};
const signIn = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Please enter email and password",
      });
    }

    const user = await User.findOne({ email: req.body.email });

    if (user) {
      if (user.authenticate(req.body.password)) {
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "30d",
        });
        const { _id, firstName, lastName, email, fullName } = user;
        res.status(StatusCodes.OK).json({
          token,
          user: { _id, firstName, lastName, email, fullName },
        });
      } else {
        res.status(StatusCodes.UNAUTHORIZED).json({
          message: "Something went wrong!",
        });
      }
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "User does not exist..!",
      });
    }
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ error });
  }
};

const getUser = async (req, res) => {
  const { email, id } = req.params;

  try {
    //find the user by email and id
    const user = await User.findOne(email ? { email } : { _id: id });

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User Not Found" });
    }

    //exclude the password hash from the responce
    const { hash_password, ...userdetails } = user.toObject();
    res.status(StatusCodes.OK).json(userdetails);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error fetching user details",
      error: error.message,
    });
  }
};

const editUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404);
    }
    res.send(user);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error editing user details",
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    console.log(user);
    if (!user) {
      return res.status(404).send("User not Found!");
    }
    res.status(StatusCodes.OK).send(user);
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error fetching user details",
      error: error.message,
    });
  }
};

module.exports = { signUp, signIn, getUser, editUser, deleteUser };
