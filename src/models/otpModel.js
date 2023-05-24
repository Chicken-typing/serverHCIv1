import mongoose from "mongoose";
const optSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  user_id: {
    type: String,
    required: true,
    unique: true,
  },
});
const OTP =  mongoose.model("OTP", optSchema)
export default OTP