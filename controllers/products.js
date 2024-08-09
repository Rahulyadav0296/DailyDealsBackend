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
    console.log(newProduct);
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

module.exports = { postProduct, postProductById };
