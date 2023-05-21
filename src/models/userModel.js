import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: false },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    avatar: { type: String },
    address: { type: String, required: true },
    birthday: { type: String, required: true }, //todo: it is unneccessary
    phone: { type: String, required: true },
    isActive: { type: Boolean },
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model('User', userSchema);
export default User;