const User = require("../models/userSchema");
const mongoose=require("mongoose")
const Product = require("../models/productSchema");
const {joiUserSchema} = require("../models/joiValidationSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
mongoose.connect("mongodb://0.0.0.0:27017/backend-project", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const stripe = require("stripe")(process.env.STRIPE_KEY_SECRET);
let temp;

module.exports = {
  //user registration

  registration: async (req, res) => {
    const { value, error } = joiUserSchema.validate(req.body);
    const { name, email, username, password } = value;
    if (error) {
      res.json(error.message);
    }
    await User.create({
      name: name,
      email: email,
      username: username,
      password: password
    });
    
    res.status(200).json({
      status: "success",
      message: "successfully registered",
    });
  },

  //User login

  userLogin: async (req, res) => {
    const { value, error } = joiUserSchema.validate(req.body);
    if (error) {
      res.json(error.message);
    }
    const { username, password } = value;
    const user =await User.findOne({ username: username});
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if(!password||!user.password){
      return res.status(400).json({status:"error",message:"invalid output"})
    }

    const checkPassword = await bcrypt.compare(password,user.password);
    if (!checkPassword) {
      res.status(400).json({status:"error",message:"password incorrect"});
    }
    const token = jwt.sign(
      { username: username },
      process.env.USER_ACCESS_TOKEN_SECRET,
      {
        expiresIn: 86400,
      }
    );
    res.status(200).json({
      status: "success",
      message: "Login successfull",
      data: token,
    });
  },

  //get product details

  productList: async (req, res) => {
    const { category } = req.query;
    const productList = await Product.find(category);
    res.status(200).json({
      status: "success",
      message: "Successfully fetched product data",
      data: productList,
    });
  },

  //Get a product details

  productById: async (req, res) => {
    const id = req.params.id;
    const productById = await Product.findById(id);
    if (!productById) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json({
      status: "success",
      message: "Successfully fetched product details",
      data: productById,
    });
  },

  //Get product based on category

  productByCategory: async (req, res) => {
    const Category = req.params.categoryname;
    const products = await Product.find({ category: Category });
    if (!products) {
      return res.status(404).json({ error: "category not found" });
    }
    res.status(200).json({
      status: "success",
      message: "Successfully fetched category details",
      data: products,
    });
  },

  //Add product to cart

  addToCart: async (req, res) => {
    const userId = req.params.id;
    const productId = req.body.productId;
    // const product = await Product.findById(req.body.productId);
    await User.updateOne({ _id: userId }, { $push: { cart: productId } });//TODO throw error if not update
    res.status(200).json({
      status: "success",
      message: "Successfully added to cart.",
    });
  },

  //delete cart items

  deleteCart: async (req, res) => {
    const userId = req.params.id;
    const product = await Product.findById(req.body.productId);
    await User.updateOne({ _id: userId }, { $pull: { cart: product } });
    res.status(200).json({
      status: "success",
      message: "successfully deleted product from cart",
    });
  },

  //show cart items

  showCart: async (req, res) => {
    const userId = req.params.id;
    const cart = await User.findOne({ _id: userId }).populate("cart");
    if (!cart) {
      return res.status(404).json({ error: "Nothing to show in cart" });
    }
    res.status(200).json({
      status: "success",
      message: "successfully fetched cart details",
      data: cart.cart,
    });
  },

  //Add product to wishlist

  addToWishList: async (req, res) => {
    const userId = req.params.id;
    const product = await Product.findById(req.body.product);
    await User.updateOne({ _id: userId }, { $push: { wishlist: product } });//TODO implement $addtoset
    res.status(200).json({
      status: "success",
      message: "Successfully added to wishlist",
    });
  },

  //show wishlist

  showWishlist: async (req, res) => {
    const userId = req.params.id;
    const wishlist = await User.find({ _id: userId }, { wishlist: 1 }).populate(
      "wishlist"
    );
    console.log(wishlist);
    if (!wishlist) {
      return res.status(404).json({ error: "nothing to show on wishlist" });
    }
    res.status(200).json({
      status: "success",
      message: "successfully fetched wishlist",
      data: wishlist,
    });
  },

  //delete wishlist

  deleteWishList: async (req, res) => {
    const userId = req.params.id;
    // const product = await Product.findById(req.body.product);
    // console.log(product)
    await User.updateOne(
      { _id: userId },
      { $pull: { wishlist: req.body.product } }
    );
    res.status(200).json({
      status: "success",
      message: "Successfully deleted from wishlist",
    });
  },

  //user payment
  payment: async (req, res) => {
    const user = await User.find({ _id: req.params.id }).populate("cart");
    const cartItem = user[0].cart.map((item) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title,
            description: item.description,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: 1,
      };
    });
    if (cartItem.length> 0) {
      const session = await stripe.checkout.sessions.create({
        line_items: cartItem,
        mode: "payment",
        success_url: `http://127.0.0.1:3000/api/user/payment/success`,
        cancel_url: `http://127.0.0.1:3000/api/user/payment/cancel`,
      });
      temp = {
        cartItem: user[0].cart,
        id: req.params.id,
        paymentid: session.id,
        amount: session.amount_total / 100,
      };
      res.send({ url: session.url });
    } else {
      res.send("no cart item");
    }
  },

  //user payment success

  success: async (req, res) => {
    const user = await User.find({ _id: temp.id });
    if (user.length != 0) {
      await User.updateOne(
        { _id: temp.id },
        {
          $push: {
            orders: {
              product: temp.cartItem,
              date: new Date(),
              orderid: Math.random(),
              paymentid: temp.paymentid,
              totalamount: temp.amount,
            },
          },
        }
      );
      await User.updateOne({ _id: temp.id }, { cart: [] });
    }
    res.status(200).json({
      status: "success",
      message: "successfully added in order",
    });
  },

  cancel: async (req, res) => {
    res.json("cancel");
  },
};

//TODO implement multer and cloudinery
