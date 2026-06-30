import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  Email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  Name: {
    type: String,
    default: ''
  },
  Phone: {
    type: String,
    default: ''
  },
  Occupation: {
    type: String,
    default: ''
  },
  City: {
    type: String,
    default: ''
  },
  Address: {
    type: String,
    default: ''
  },
  Zipcode: {
    type: String,
    default: ''
  },
  State: {
    type: String,
    default: ''
  },
  Country: {
    type: String,
    default: ''
  },
  Balance: {
    type: Number,
    default: null
  },
  OTP: {
    type: String,
    default: null
  },
  OTPExpires: {
    type: Date,
    default: null
  },
  LastLoginRequest: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;
