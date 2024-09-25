const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, default: "general" },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  sizes: [String],
  colors: [String],
  description: { type: String, required: true },
  rating: { type: Number, default: 0 },
  comments: [
    {
      user: String,
      text: String,
      date: { type: Date, default: Date.now },
    },
  ],
  reviews: [
    {
      user: String,
      rating: Number,
      review: String,
      date: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Product", productSchema);
