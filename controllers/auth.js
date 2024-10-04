const { StatusCodes } = require("http-status-codes");
const User = require("../models/auth");
const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs"); 

const signUp = async (req, res) => {
  const {
    firstName,
    lastName,
    username,
    email,
    password,
    profilePicture,
    contactNumber,
    role,
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

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "User already registered",
      });
    }

    if (role === "admin" && (!req.user || req.user.role !== "admin")) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "You are not authorized to create an admin user",
      });
    }

    const hash_password = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      username,
      hash_password,
      profilePicture,
      contactNumber,
      role: role === "admin" ? "admin" : "user",
    });

    return res.status(StatusCodes.CREATED).json({
      message: "User created successfully",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        contactNumber: user.contactNumber,
      },
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error creating user",
      error: error.message,
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
        const token = jwt.sign(
          { _id: user._id, role: user.role },
          process.env.JWT_SECRET,
          {
            expiresIn: "30d",
          }
        );

        res.cookie("token", token, {
          httpOnly: true,
          sameSite: "Strict",
          // secure: process.env.NODE_ENV === "production"
          maxAge: 60 * 60 * 1000, // 1 hour
        });

        const { _id, firstName, lastName, email, fullName, role } = user;
        res.status(StatusCodes.OK).json({
          token,
          user: { _id, firstName, lastName, email, fullName, role },
        });
      } else {
        res.status(StatusCodes.UNAUTHORIZED).json({
          message: "Invalid Creadential",
        });
      }
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "User does not exist..!",
      });
    }
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Something went wrong",
      error: error.message,
    });
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
    return res.status(StatusCodes.OK).json(userdetails);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error fetching user details",
      error: error.message,
    });
  }
};

const getAllUser = async (req, res) => {
  try {
    const users = await User.find();

    if (users.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User Not Found" });
    }

    return res.status(StatusCodes.OK).json(users);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
  if (req.user.role !== "admin") {
    return res.status(StatusCodes.FORBIDDEN).json({
      message: "Only admin can delete users",
    });
  }
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

module.exports = { signUp, signIn, getUser, editUser, deleteUser, getAllUser };
