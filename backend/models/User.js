import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
},
  loginEmailSent: {
    type: Boolean,
    default: false
},
  education: {
    type: String,
    required: true
  },
  career: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  skills: {
    type: String
  },
  goal: {
    type: String
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
},

  passwordResetOtpHash: {
    type: String,
    default: undefined,
    select: false
  },
  passwordResetOtpExpires: {
    type: Date,
    default: undefined,
    select: false
  },
  passwordResetOtpAttempts: {
    type: Number,
    default: 0,
    select: false
  }
});

const userModel = mongoose.model("users", userSchema);
export default userModel;