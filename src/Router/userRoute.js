import express, { response } from "express";
import bcrypt from "bcryptjs";
import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import {
  isAuthenticated,
  isAdmin,
  generateToken,
  isMasterAdmin,
} from "../utils.js";

const userRoute = express.Router();

userRoute.get(
  "/",
  isAuthenticated,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const users = await User.find();
    res.send(users);
  })
);

userRoute.post(
  "/",
  isAuthenticated,
  isMasterAdmin,
  expressAsyncHandler(async (req, res) => {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      // avatar: req.body.avatar,
      birthday: req.body.birthday,
      address: req.body.address,
      phone: req.body.phone,
      role: "admin",
      isActive: true,
      password: bcrypt.hashSync(req.body.password),
    });
    const user = await newUser.save();
    res.send({
      _id: user._id,
      username: user.username,
      email: user.email,
      birthday: user.birthday,
      address: user.address,
      phone: user.phone,
      role: "admin",
      isActive: true,
      token: generateToken(user),
    });
  })
);

userRoute.delete(
  "/:id",
  isAuthenticated,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.role === "masteradmin") {
        res.status(400).send({ message: "Can Not Delete Admin User" });
        return;
      }
      await user.remove();
      res.send({ message: "User Deleted" });
    } else {
      res.status(404).send({ message: "User Not Found" });
    }
  })
);

userRoute.post(
  "/signin",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          birthday: user.birthday,
          phone: user.phone,
          address: user.address,
          isActive: user.isActive,
          password: user.password,
          token: generateToken(user),
        });
        return;
      }
    }
    res.status(401).send({ message: "Invalid email or password" });
  })
);

userRoute.post(
  "/signup",
  expressAsyncHandler(async (req, res) => {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      avatar: req.body.avatar,
      birthday: req.body.birthday,
      address: req.body.address,
      phone: req.body.phone,
      role: "customer",
      isActive: true,
      password: bcrypt.hashSync(req.body.password),
    });
    const user = await newUser.save();
    res.send({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: "customer",
      isActive: true,
      token: generateToken(user),
    });
  })
);

userRoute.put(
  "/:id/profile",
  isAuthenticated,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user && user.role !== "masteradmin") {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.address = req.body.address || user.address;
      user.avatar = req.body.avatar || user.avatar;
      user.birthday = req.body.birthday || user.birthday;
      user.phone = req.body.phone || user.phone;
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password);
      }
      const updatedUser = await user.save();
      res.send({
        _id: updatedUser._id,
        name: updatedUser.username,
        email: updatedUser.email,
        password: updatedUser.password,
        birthday: updatedUser.birthday,
        address: updatedUser.address,
        phone: updatedUser.phone,
        // token: generateToken(updatedUser), TODO:only use can edit password
      });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  })
);
userRoute.put(
  "/:id",
  isAuthenticated,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.body._id);
    if (user && user.role!=='masteradmin') {
      user.isActive = req.body.isActive;
      // if (req.body.password) {
      //   user.password = bcrypt.hashSync(req.body.password, 8);
      // } else {
      //   user.password = user.password;
      // }
      const updatedUser = await user.save();
      res.send({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        birthday: updatedUser.birthday,
        address: updatedUser.address,
        phone: updatedUser.phone,
        isActive: updatedUser.isActive,
        token: generateToken(updatedUser),
      });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  })
);

export default userRoute;
