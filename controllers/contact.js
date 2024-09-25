const Contact = require("../models/contact");
const { StatusCodes } = require("http-status-codes");

const contactPost = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  try {
    const newContact = new Contact({
      name: name,
      email: email,
      phone: phone,
      subject: subject,
      message: message,
    });
    await newContact.save();
    return res
      .status(StatusCodes.OK)
      .json({ message: `Thank you ${name} We will contact you soon!` });
  } catch (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error });
  }
};
module.exports = contactPost;
