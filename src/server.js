import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import productRoute from "./Router/productRoute.js";
import userRoute from "./Router/userRoute.js";
import orderRoute from "./Router/orderRoute.js";
import chatRoute from "./Router/chatRoute.js";
import cors from "cors";
import authenRoute from "./Router/authenRoute.js";
import resetRoute from "./Router/repasswordRoute.js";
dotenv.config();
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log(error.message);
  });

const app = express();

app.use(cors());

//middleware get information from client by req.body
app.use(express.json({ limit: "50mb" }));

app.use(express.urlencoded({ extended: true }));

app.use("/api/products", productRoute);
app.use("/api/users", userRoute);
app.use("/api/orders", orderRoute);
app.use("/api/room", chatRoute);
app.use("/vtoken", authenRoute);
app.use("/forgot",resetRoute)
app.get("/api/keys/paypal", (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || "sb");
});
app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

const port = process.env.PORT || 5000;
const httpServer = app.listen(port, () => {
  console.log(`server listening on port: ${port}`);
});


