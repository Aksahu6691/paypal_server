import express from "express";
import { createProduct } from "./product.controller";
import { upload } from "../../utils/fileUpload";

const productRoutes = express.Router();

productRoutes.post("/create", upload.single("image"), createProduct);

export default productRoutes;
