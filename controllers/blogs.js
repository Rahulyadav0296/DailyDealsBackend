const { StatusCodes } = require("http-status-codes");
const User = require("../models/auth");
const Blog = require("../models/blogs");

exports.createBlog = async (req, res) => {
  const { authorId, title, category, image, content } = req.body;

  if (!title || !content || !category || !image) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Title, content, image, category and authorId are required.",
    });
  }

  try {
    const authExists = await User.findById(authorId);

    if (!authExists) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Auther (User) Not Found!" });
    }

    const newBlog = new Blog({
      title,
      content,
      image,
      category,
      user: authorId,
    });

    const savedBlog = await newBlog.save();

    return res
      .status(StatusCodes.CREATED)
      .json({ message: "Blog Post Created Successfully!", blog: savedBlog });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error", error: error.message });
  }
};

exports.getBlogById = async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await Blog.find({ user: id }).populate("user", "name email");

    if (!blog) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "No Blogs Found!" });
    }

    return res.status(StatusCodes.OK).json(blog);
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error", error: error.message });
  }
};

exports.updateBlog = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Blog Not Updated!" });
    }
    return res.status(StatusCodes.OK).json({ updatedBlog });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error", error: error.message });
  }
};

exports.deleteBlog = async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "Blog Not Found!" });
    }

    return res
      .status(StatusCodes.OK)
      .json({ message: "Blog Deleted Successfully!" });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error", error: error.message });
  }
};
