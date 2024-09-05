const express = require("express");
require("dotenv").config();
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_API_SECRET_KEY);
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
const authRoute = require("./router/auth");
const contactRoute = require("./router/contact");
const productRoute = require("./router/products");
const cartRoute = require("./router/cart");
const { StatusCodes } = require("http-status-codes");
const helmet = require("helmet");
// Denial-of-Service(DoS) attack
// An attacked uses a network of hijacked computers
// This network is used to flood the target site with phny server requests, leaving no
// bandwidth for legitimate traffic.
// const rateLimit = require("express-rate-limit");
// const csrf = require("csurf");
// const cookieParser = require("cookie-parser");
const { body, validationResult } = require("express-validator");

// const apiLimit = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100,
//   message: "Too Many Requested from this IP, Please Try again after 15 minutes",
// });

const app = express();
// app.use(apiLimit);
// app.use(cookieParser);
// const csrfProtection = csrf({ cookie: true });
// app.use(csrfProtection);
app.use(cors());
// use helmet to set secure HTTP headers, which help protect agaist several web vulnerability, including XSS and clickjacking
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(authRoute);
app.use(contactRoute);
app.use(productRoute);
app.use(cartRoute);
const port = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

app.post(
  "/create-payment-intent",
  [
    body("items").isArray().withMessage("Items must be an array"),
    body("userId").isArray().withMessage("User ID must be a string"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() });
    }
    const { items, userId } = req.body;

    if (!items) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Items is not available" });
    }

    //calculate total price
    let totalPrice = 0;
    items.forEach((item) => {
      totalPrice += item.quantity * item.product.price;
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.floor(totalPrice * 100),
      currency: "usd",
      metadata: { userId },
    });
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  }
);

mongoose
  .connect(MONGO_URL)
  .then((request) => {
    app.listen(port);
  })
  .then((request) => {
    console.log("Congrates, Database Connected!");
  })
  .catch((err) => {
    console.error(err);
  });
