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

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(authRoute);
app.use(contactRoute);
app.use(productRoute);
app.use(cartRoute);
const port = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

app.post("/create-payment-intent", async (req, res) => {
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
});

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
