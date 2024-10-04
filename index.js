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
const blogRoute = require("./router/blogs");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const csrf = require("csurf");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const http = require("http");

const port = process.env.PORT || 5000;
const MONGO_URL =
  process.env.MONGO_URL ||
  "mongodb+srv://rajendrayadav510:0L6H4dY7zao4IAWt@cluster0.wogscif.mongodb.net/Blog?retryWrites=true&w=majority&appName=Cluster0";
const environment = process.env.NODE_ENV || "development";

const app = express();

app.use(
  cors({
    origin: "https://daily-deals-shopping-front-voab.vercel.app",
    credentials: true,
  })
);
app.use(helmet());
app.use(bodyParser.json()); // Use only one body parser
app.use(authRoute);
app.use(contactRoute);
app.use(productRoute);
app.use(cartRoute);
app.use(blogRoute);

console.log(`Running in ${environment} mode`);
app.use(cookieParser());
if (environment === "production") {
  const apiLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message:
      "Too Many Requests from this IP, Please Try again after 15 minutes",
  });
  app.use(apiLimit);
  app.use(cookieParser());
  const csrfProtection = csrf({ cookie: true });
  app.use(csrfProtection);
}

const server = http.createServer(app);

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

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "https://daily-deals-shopping-front-voab.vercel.app", // Your frontend URL
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

// Connect to MongoDB
if (!MONGO_URL) {
  console.error("MONGO_URL is not defined in environment variables.");
  process.exit(1); // Exit the application if MONGO_URL is not defined
}

mongoose
  .connect(MONGO_URL)
  .then(() => {
    // Start the server with Socket.IO
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
    console.log("Congratulations, Database connected!");

    // Handle Socket.IO connections
    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      // Listen for an event from the client
      socket.on("newData", (data) => {
        // Emit the new data to all connected clients
        io.emit("newData", data);
      });

      socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
      });
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
