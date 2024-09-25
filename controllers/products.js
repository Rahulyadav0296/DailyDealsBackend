const { StatusCodes } = require("http-status-codes");
const Products = require("../models/products");

const postProduct = async (req, res) => {
  try {
    const products = await Products.find();
    res.status(StatusCodes.OK).json(products);
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.BAD_REQUEST).json({ message: error });
  }
};

const postProductById = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const newProduct = await Products.findById(id);

    if (newProduct) {
      res.status(StatusCodes.OK).json(newProduct);
    } else {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Product Not Found!" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Internal server error" });
  }
};

const postRateAndReview = async (req, res) => {
  const productId = req.params.id;
  const { rating, comments, reviews, type } = req.body;

  console.log("production id is: ", productId);
  try {
    const product = await Products.findById(productId);

    if (!product) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Product Not Found!" });
    }

    if (!product.type && type) {
      product.type = type; // Ensure `type` is provided
    }

    product.rating = rating;
    product.comments.push({
      user: req.user?.name || "Anonymous",
      text: comments,
    });
    product.reviews.push({
      user: req.user?.name || "Anonymous",
      rating: rating,
      review: reviews,
    });

    await product.save();
    return res
      .status(StatusCodes.OK)
      .json({ message: "Rating and review added successfully!" });
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Internal server error" });
  }
};

module.exports = { postProduct, postProductById, postRateAndReview };
