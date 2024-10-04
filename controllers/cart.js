const { StatusCodes } = require("http-status-codes");
const Cart = require("../models/cart");
const Product = require("../models/products");
const mongoose = require("mongoose");

// create a new cart or add items to an existring cart
exports.addToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    let cart = await Cart.findOne({ user: userId });
    let product = await Product.findById(productId);

    if (!product) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Product Not Found!" });
    }

    if (cart) {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        //product exists in the cart, update quantity
        cart.items[itemIndex].quantity += quantity;
        cart.totalQuantity += quantity;
      } else {
        //product does not exists in the cart, add new item
        cart.items.push({ product: productId, quantity });
        cart.totalQuantity += quantity;
      }

      cart.totalPrice += product.price * quantity;
      await cart.save();
    } else {
      //create a new cart
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity }],

        totalPrice: product.price * quantity,
        totalQuantity: quantity,
      });
      await cart.save();
    }
    res.status(StatusCodes.OK).json(cart);
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Internal server error" });
  }
};

//get the cart for a specific user
exports.getCart = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Invalid User Id" });
  }

  try {
    if (!userId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "User Id is required" });
    }
    const updatedCart = await Cart.findOne({ user: userId })
      .populate("items.product") // Populating the product field
      .exec();
    console.log("Updated cart is: ", updatedCart);

    if (!updatedCart) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Cart not found" });
    }
    res.status(StatusCodes.OK).json(updatedCart);
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Internal server error" });
  }
};

//remove item from an cart
exports.removeFromCart = async (req, res) => {
  const { userId, productId } = req.body;
  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "Cart Not Found!" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      const item = cart.items[itemIndex];
      const product = await Product.findById(item.product);
      console.log(item);
      if (!product) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "Product Not Found!" });
      }

      console.log(item);

      const itemPrice = product.price || 0;
      const itemQuantity = item.quantity || 0;

      console.log(itemPrice, itemQuantity);

      cart.totalPrice -= itemPrice * itemQuantity;
      cart.totalQuantity -= itemQuantity;

      if (cart.totalQuantity < 0) {
        cart.totalQuantity = 0;
      }
      if (cart.totalPrice < 0) {
        cart.totalPrice = 0;
      }

      cart.items.splice(itemIndex, 1);
      if (cart.items.length === 0) {
        cart.totalPrice = 0;
      }

      if (cart.items.length === 0) {
        cart.totalQuantity = 0;
      }
    } else {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Item not found in cart" });
    }

    await cart.save();
    res.status(StatusCodes.OK).json(cart);
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Internal server error" });
  }
};

//clear the cart
exports.clearCart = async (req, res) => {
  const { userId } = req.params;

  try {
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Cart Not Found!" });
    }

    cart.items = [];
    cart.totalPrice = 0;
    cart.totalQuantity = 0;
    await cart.save();
    res.status(StatusCodes.OK).json(cart);
  } catch (error) {
    console.error(error);
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Internal server error" });
  }
};
