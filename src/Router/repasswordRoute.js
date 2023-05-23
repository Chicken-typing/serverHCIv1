import express from "express";
import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import OTP from "../models/otpModel.js";
import generateOTP from "../utils/generateOTP.js";
import sendOTP from "../utils/sendOTP.js";
const resetRoute = express.Router();
resetRoute.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const otpExist = await OTP.findOne({ email: req.body.email });
    if (otpExist) {
      otpExist.code = generateOTP();
      res.status(200).send({ message: "OTP is re-generated." });
      const newOTP = await otpExist.save();
      sendOTP(newOTP.email, newOTP.code);
    } else {
      if (user) {
        res.status(200).send({ message: "Email is exist." });
        const otp = new OTP({
          email: user.email,
          code: generateOTP(),
          user_id: user._id,
        });
        const newOTP = await otp.save();
        sendOTP(newOTP.email, newOTP.code);
      } else {
        res.status(404).send({ message: "Email is not exist." });
      }
    }
  })
);
resetRoute.post(
  "/validate-code",
  expressAsyncHandler(async (req, res) => {
    const account = await OTP.findOne({ email: req.body.email });
    if (account) {
      if (account.code === req.body.code) {
        res
          .status(200)
          .send({ message: "OTP is valid.", data: account.user_id });
      } else {
        res.status(404).send({ message: " OTP is not valid." });
      }
    } else {
      res.status(404).send({ message: "Error to find account." });
    }
  })
);
resetRoute.put(
  "/reset-password",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.body.user_id);
    user.password = bcrypt.hashSync(req.body.password);
    await user.save();
    res.status(200).send({ message: "Password Reset Successfully." });
    await OTP.findOneAndRemove({ user_id: user._id });
  })
);

export default resetRoute;
