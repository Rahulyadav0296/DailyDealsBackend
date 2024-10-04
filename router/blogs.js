const express = require("express");
const router = express.Router();
const {
  createBlog,
  getBlogById,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogs");

router.get("/blog/:id", getBlogById); // Ensure this route is properly set up
router.post("/blog", createBlog); // For creating a blog post
router.put("/blog/:id", updateBlog); // For updating a blog post
router.delete("/blog/:id", deleteBlog); // For deleting a blog post

module.exports = router;
