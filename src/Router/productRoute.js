import express from "express";
import expressAsyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import isAdmin from "../utils/isAdmin.js";
import isAuthenticated from "../utils/isAuthenticated.js";

const productRoute = express.Router();

productRoute.get("/", async (req, res) => {
  const products = await Product.find();
  res.send(products);
});

productRoute.post(
  "/",
  isAuthenticated,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const newProduct = new Product({
      name: req.body.name,
      images: req.body.images,
      defaultImage: req.body.images[0],
      price: req.body.price,
      category: req.body.category,
      size: ["35", "36", "37", "38", "39", "40", "41", "42", "43"],
      brand: req.body.brand,
      countInStock: req.body.countInStock,
      rating: 0,
      numReviews: 0,
      description: req.body.description,
    });
    const product = await newProduct.save();
    res.send({
      _id: product._id,
      name: product.name,
      images: product.images,
      defaultImage: product.defaultImage,
      price: product.price,
      category: product.category,
      size: product.size,
      brand: product.brand,
      countInStock: product.countInStock,
      rating: product.rating,
      numReviews: product.numReviews,
      description: product.description,
    });
  })
);

productRoute.put(
  "/:id",
  isAuthenticated,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      product.price = req.body.price || product.price;
      product.description = req.body.description || product.description;
      await product.save();
      res.send({ message: "Product Updated" });
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  })
);

productRoute.delete(
  "/:id",
  isAuthenticated,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.remove();
      res.send({ message: "Product Deleted" });
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  })
);

productRoute.post(//todo not be refactored
  "/:id/reviews",
  isAuthenticated,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      if (product.reviews.find((x) => x.email === req.user.email)) {
        return res
          .status(400)
          .send({ message: "You already submitted a review" });
      }

      const review = {
        name: req.user.username,
        email: req.user.email,
        rating: Number(req.body.rating),
        comment: req.body.comment,
      };
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((a, c) => c.rating + a, 0) /
        product.reviews.length;
      const updatedProduct = await product.save();
      res.status(201).send({
        message: "Review Created",
        review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
        numReviews: product.numReviews,
        rating: product.rating,
      });
    } else {
      res.status(404).send({ message: "Product Not Found" });
    }
  })
);

productRoute.delete(
  //todo not be refactored
  "/:prodId/reviews/:id",
  isAuthenticated,
  expressAsyncHandler(async (req, res) => {
    await Product.findOneAndUpdate(
      { _id: req.params.prodId },
      { $pull: { reviews: { _id: req.params.id } } }
    );
    const product = await Product.findById(req.params.prodId);
    if (product.reviews.length > 0) {
      product.rating =
        product.reviews.reduce((a, c) => c.rating + a, 0) /
        product.reviews.length;
    } else {
      product.rating = 0;
    }
    await product.save();
    res.status(200).send({ message: "Review deleted" });
  })
);

const PAGE_SIZE = 3;

productRoute.get(
  "/admin",
  isAuthenticated,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;

    const products = await Product.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countProducts = await Product.countDocuments();
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

productRoute.get(
  "/categories",
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct("category");
    res.send(categories);
  })
);

productRoute.get("/slug/:slug", async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: "Product Not Found" });
  }
});
productRoute.get("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: "Product Not Found" });
  }
});

export default productRoute;
