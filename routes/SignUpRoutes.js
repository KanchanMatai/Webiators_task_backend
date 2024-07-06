const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const User = require("../models/SignUp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Product = require("../models/Product");
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
console.log(Product);
// Signup

router.post("/signup", async (req, res) => {
  try {
    const { userName, age, email, mobile, address, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      userName,
      age,
      email,
      mobile,
      address,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const expiresInDays = 8;
    const accessToken = jwt.sign({ id: user._id }, "your_jwt_secret", {
      expiresIn: expiresInDays * 24 * 60 * 60, // Expiry in seconds
    });
    console.log(`Stored hashed password: ${user.password}`);
    console.log(`Provided plain password: ${password}`);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const expiresInSeconds = 8 * 24 * 60 * 60; // 8 days in seconds
    const token = jwt.sign({ id: user._id }, "your_jwt_secret");
    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//   Get all products(READ)


router.get('/products', async (req, res) => {
    try {
      // Fetch all products from the database
      const products = await Product.find();
  
      res.status(200).json(products);
    } catch (err) {
      console.error('Error while fetching products:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // get the product by productid
  // Route to fetch a product by ID
router.get('/products/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    console.log('Received productId:', product); 
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (err) {
    console.error('Error while fetching product:', err);
    res.status(500).json({ error: err.message });
  }
});
// User can add the product info

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Unique file name
  },
});

const upload = multer({ storage });
// Validation rules
const productValidationRules = () => {
  return [
    body("metaTitle")
      .isString()
      .withMessage("Meta Title must be a string")
      .notEmpty()
      .withMessage("Meta Title is required"),
    body("productName")
      .isString()
      .withMessage("Product Name must be a string")
      .notEmpty()
      .withMessage("Product Name is required"),
    body("productUrlSlug")
      .isString()
      .withMessage("Product URL Slug must be a string")
      .notEmpty()
      .withMessage("Product URL Slug is required"),
    body("price")
      .isNumeric()
      .withMessage("Price must be a number")
      .notEmpty()
      .withMessage("Price is required"),
    body("discountedPrice")
      .isNumeric()
      .withMessage("Discounted Price must be a number")
      .notEmpty()
      .withMessage("Discounted Price is required"),
    body("description")
      .isString()
      .withMessage("Description must be a string")
      .notEmpty()
      .withMessage("Description is required"),
    // body("createdBy")
    //   .isMongoId()
    //   .withMessage("Created By must be a valid user ID")
    //   .notEmpty()
    //   .withMessage("Created By is required"),
    body("galleryImages")
      .isArray({ min: 1 })
      .withMessage("Gallery Images must be an array with at least one image")
      .custom((array) => array.every((item) => typeof item === "string"))
      .withMessage("Each gallery image must be a string"),
  ];
};
// product add routes
router.use(authMiddleware);
router.post(
  "/add-product",
  upload.array("galleryImages", 10),
  productValidationRules(),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No files were uploaded." });
      }

      const {
        metaTitle,
        productName,
        productUrlSlug,
        price,
        discountedPrice,
        description,
        createdBy,
      } = req.body;
      const galleryImages = req.files.map((file) => file.path);

      // Create new product instance
      const newProduct = new Product({
        metaTitle,
        productName,
        productUrlSlug,
        galleryImages,
        price,
        discountedPrice,
        description,
        createdBy: new mongoose.Types.ObjectId(createdBy), // Correct usage of ObjectId
      });

      // Save the product to the database
      await newProduct.save();

      res.status(201).json({ message: "Product added successfully" });
    } catch (err) {
      console.error("Error while processing product addition:", err);
      res.status(500).json({ error: err.message });
    }
  }
);
// Edit product info

router.put('/edit-product/:productId', upload.array('galleryImages', 10), productValidationRules(), async (req, res) => {
    try {
      const productId = req.params.productId;
      const {
        metaTitle,
        productName,
        productUrlSlug,
        price,
        discountedPrice,
        description,
        createdBy,
      } = req.body;
  
      let updateFields = {
        metaTitle,
        productName,
        productUrlSlug,
        price,
        discountedPrice,
        description,
        createdBy: new mongoose.Types.ObjectId(createdBy), // Correct usage of ObjectId
      };
  
      if (req.files && req.files.length > 0) {
        updateFields.galleryImages = req.files.map((file) => file.path);
      }
  
      // Update the product in the database
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        updateFields,
        { new: true } // to return the updated document
      );
  
      if (!updatedProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (err) {
      console.error('Error while updating product:', err);
      res.status(500).json({ error: err.message });
    }
  });
  // Delete product info

  router.delete('/delete-product/:productId', async (req, res) => {
    try {
      const productId = req.params.productId;
  
      // Validate if productId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ error: 'Invalid Product ID' });
      }
  
      // Find the product by ID and delete it
      const deletedProduct = await Product.findByIdAndDelete(productId);
  
      if (!deletedProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
  
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
      console.error('Error while deleting product:', err);
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;
