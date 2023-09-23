const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart:[{
    type: mongoose.Schema.ObjectId,
    ref:"Product",
    required:true
   
  }] ,
  wishlist: [{
    type: mongoose.Schema.ObjectId,
    ref:"Product",
    required: true,
  }],
  orders: [],
});
userSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();

  const hashedPassword = await bcrypt.hash(user.password, 10);
  user.password = hashedPassword;
  next();
});

module.exports = mongoose.model("User", userSchema);
