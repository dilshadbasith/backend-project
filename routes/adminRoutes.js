const express = require("express");
const router = express.Router();
const controller = require("../controllers/adminController");
const jwt = require("jsonwebtoken");
const TryCatch = require("../middlewares/tryCatchMiddleware");
const verifyToken=require("../middlewares/AdminAuthMiddleware")
const upload=require("../middlewares/photoUpload")

router.use(express.json());

router.post("/login",TryCatch(controller.login))
router.get("/users",verifyToken,TryCatch(controller.getallusers ))
router.get("/users/:id",verifyToken,TryCatch(controller.getuserById))
router.get("/products",verifyToken,TryCatch(controller.getallproducts))
router.get("/products/category",verifyToken,TryCatch(controller.getProductsByCategory))
router.get("/products/:id",verifyToken,TryCatch(controller.getProductById))
router.post("/products",verifyToken,upload,TryCatch(controller.createProduct))
router.put("/products",verifyToken,TryCatch(controller.updateProduct))
router.delete("/products",verifyToken,TryCatch(controller.deleteProduct))
router.get("/stats",verifyToken,TryCatch(controller.stats))
router.get("/orders",verifyToken,TryCatch(controller.orders))

module.exports=router