require("dotenv").config();
const mongoose=require("mongoose")
const User = require("../models/userSchema");
const Product = require("../models/productSchema");
const {joiProductSchema} = require("../models/joiValidationSchema");
const jwt = require("jsonwebtoken");
mongoose.connect("mongodb://0.0.0.0:27017/backend-project", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = {
  //admin login

  login: async (req, res) => {
    const { username, password } = req.body;
    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      //TODO store at .env
      const token = jwt.sign(
        { username: username },
        process.env.ADMIN_ACCESS_TOKEN_SECRET
      );
      res.status(200).json({
        status: "success",
        message: "Successfully logged in",
        data: { jwt_token: token },
      });
    } else {
      return res.status(404).json({ error: "Not an admin" });
    }
  },

  //Get all users list

  getallusers: async (req, res) => {
    const allUsers = await User.find(); //TODO all variables must be camelcase
    res.status(200).json({
      status: "success",
      message: "Successfully fetched users data",
      data: allUsers,
    });
  },

  //Get a specific user

  getuserById: async (req, res) => {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      status: "success",
      message: "Successfully fetched user data",
      data: user,
    });
  },

  //Get all Products list

  getallproducts: async (req, res) => {
    const allproducts = await Product.find();
    res.status(200).json({
      status: "success",
      message: "Successfully fetched product detail",
      data: allproducts,
    });
  },

  //Get products based on the category

  getProductsByCategory: async (req, res) => {
    const category = req.query.name;
    const products = await Product.find({ category });
    console.log(category);
    if (!products) {
      return res.status(404).json({ error: "category not found" });
    }
    res.status(200).json({
      status: "success",
      message: "Successfully fetched product details",
      data: products,
    });
  },

  //Get a product by Id

  getProductById: async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      status: "success",
      message: "Successfully fetched product details",
      data: product,
    });
  },

  //create products

  createProduct: async (req, res) => {
    const {value,error}=joiProductSchema.validate(req.body)
    const { title, description, image, price, category } = value;
    if(error){
      res.json(error.message)
    }
    await Product.create({
      title,
      description,
      image,
      price,
      category,
    });
    res.status(200).json({
      status: "success",
      message: "successfully created a product ",
    });
  },

  //update product

  updateProduct: async (req, res) => {
    const { title, description, image, price, category, id } = req.body;
    await Product.findByIdAndUpdate(id, {
      title: title,
      description: description,
      price: price,
      image: image,
      category: category,
    });
    res.status(201).json({
      status: "success",
      message: "Successfully updated the product",
    });
  },

  //delete product

  deleteProduct: async (req, res) => {
    const { id } = req.body;
    await Product.findByIdAndDelete(id);
    res.status(201).json({
      status: "success",
      message: "Successfully deleted product",
    });
  },

  // Get Stats

  stats: async (req, res) => {
    const aggregation = User.aggregate([
      {
        $unwind: "$orders",
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$orders.totalamount" },
          totalItemSold: { $sum: { $size: "$orders.product" } },
        },
      },
    ]);
    const result=await aggregation.exec();
    const totalRevenue=result[0].totalRevenue;
    const totalItemSold=result[0].totalItemSold;
    res.json({
      status:"success",
      message:"successfully fetched stats.",
      data:{
        "Total Revenue":totalRevenue,
        "Total Items Sold":totalItemSold,  
      }
    })
  },

  //Get order details

  orders:async(req,res)=>{
    const order=await User.find({orders:{$exists:true}})
    const orders=order.filter((item)=>{
      return item.orders.length>0;
    })
    res.json({
      status:"success",
      message:"successfully fetched order details",
      data:orders
    })
  }
};
