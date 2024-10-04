const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = new mongoose.Schema(
  {
    firstName: {
      type: String,
      require: true,
      trim: true,
      min: 3,
      max: 20,
    },
    lastName: {
      type: String,
      require: true,
      trim: true,
      min: 3,
      max: 20,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    hash_password: {
      type: String,
      require: true,
    },
    contactNumber: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);
// for get Fullname when we get data from database
User.virtual("fullname").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

User.method({
  async authenticate(password) {
    return bcrypt.compare(password, this.hash_password);
  },
});

// Hash password before saving
User.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("User", User);
