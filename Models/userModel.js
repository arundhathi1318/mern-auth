import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, unique: true },
  verifyotp: { type: String, default: '' },
  verifyotpexpireat: { type: Number, default: 0 },
  isverified: { type: Boolean, default: false },
  resetotp: { type: String, default: '' },
  resetotpexpiresat: { type: Number, default: 0 }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
