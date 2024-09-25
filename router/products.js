const express = require("express");
const productController = require("../controllers/products");
const router = express.Router();

router.get("/products", productController.postProduct);
router.get("/products/:id", productController.postProductById);
router.post("/products/reviews/:id", productController.postRateAndReview);
module.exports = router;
