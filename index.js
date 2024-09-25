const express = require("express");
require("dotenv").config();
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_API_SECRET_KEY);
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const contactRoute = require("./router/contact");
const productRoute = require("./router/products");
const cartRoute = require("./router/cart");
const authRoute = require("./router/auth"); // Ensure this route is imported
const { StatusCodes } = require("http-status-codes");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");

const port = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;
const environment = process.env.NODE_ENV || "development";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(helmet());
app.use(bodyParser.json()); // Use only one body parser
app.use(authRoute);
app.use(contactRoute);
app.use(productRoute);
app.use(cartRoute);

console.log(`Running in ${environment} mode`);
app.use(cookieParser());
// if (environment === "production") {
//   const apiLimit = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100,
//     message:
//       "Too Many Requests from this IP, Please Try again after 15 minutes",
//   });
//   app.use(apiLimit);
//   app.use(cookieParser());
//   const csrfProtection = csrf({ cookie: true });
//   app.use(csrfProtection);
// }

app.post(
  "/create-payment-intent",
  [
    body("items").isArray().withMessage("Items must be an array"),
    body("userId").isString().withMessage("User ID must be a string"), // Correct this to check if userId is a string
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() });
    }
    const { items, userId } = req.body;

    if (!items || items.length === 0) {
      // Check if items are not available or empty
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Items are not available" });
    }

    // Calculate total price
    let totalPrice = 0;
    items.forEach((item) => {
      totalPrice += item.quantity * item.product.price;
    });

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.floor(totalPrice * 100),
        currency: "usd",
        metadata: { userId },
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: "Payment processing error" });
    }
  }
);

// Connect to MongoDB
if (!MONGO_URL) {
  console.error("MONGO_URL is not defined in environment variables.");
  process.exit(1); // Exit the application if MONGO_URL is not defined
}

mongoose
  .connect(MONGO_URL)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log("Congrats, Database Connected!");
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
