import express from "express";
import { isAuthenticated } from "../utils.js";
import expressAsyncHandler from "express-async-handler";
const authenRoute = express.Router();
authenRoute.get("/", isAuthenticated, expressAsyncHandler(async(req, res)=> {
   res.status(201).send({ message: "Welcome to DKL store" });
}));
export default authenRoute;
