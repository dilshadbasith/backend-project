const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");
const jwt = require("jsonwebtoken");
const TryCatch = require("../middlewares/tryCatchMiddleware");
const verifyToken = require("../middlewares/UserAuthMiddleware");

router.use(express.json());

router.post("/login", TryCatch(controller.userLogin));
router.post("/register", TryCatch(controller.registration));
router.get("/products", verifyToken, TryCatch(controller.productList));
router.get("/products/:id", verifyToken, TryCatch(controller.productById));
// router.get("/products/category/:categoryname", verifyToken, TryCatch(controller.productByCategory));
router.post("/:id/cart", verifyToken, TryCatch(controller.addToCart));
router.get("/:id/cart", verifyToken, TryCatch(controller.showCart));
router.delete("/:id/cart", verifyToken, TryCatch(controller.deleteCart));
router.post("/:id/wishlists", verifyToken, TryCatch(controller.addToWishList));
router.get("/:id/wishlists", verifyToken, TryCatch(controller.showWishlist));
router.delete("/:id/wishlists", verifyToken, TryCatch(controller.deleteWishList));
router.post('/:id/payment',verifyToken, TryCatch(controller.payment))
router.get('/payment/success', TryCatch(controller.success))
router.post('/payment/cancel', TryCatch(controller.cancel))
module.exports = router;
