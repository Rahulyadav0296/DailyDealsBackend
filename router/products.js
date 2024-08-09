const express = require("express");
const productController = require("../controllers/products");
const router = express.Router();

router.get("/products", productController.postProduct);
router.get("/products/:id", productController.postProductById);
module.exports = router;
