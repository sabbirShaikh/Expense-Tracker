import User from '../models/User.js';
import { sendOTPEmail } from '../utils/mailer.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secure-secret-key-12345';

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sanitizeUser = (user) => {
  if (!user) return null;
  const userObj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  delete userObj.OTP;
  delete userObj.OTPExpires;
  return userObj;
};

export const checkEmail = async (req, res) => {
  const email = req.body.email || req.body.Email;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await User.findOne({ Email: normalizedEmail });
    if (user) {
      const otp = generateOTP();
      user.OTP = otp;
      user.OTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      user.LastLoginRequest = new Date();
      await user.save();

      await sendOTPEmail(normalizedEmail, otp);

      return res.json({
        success: true,
        exists: true,
        ...(process.env.DEVELOPMENT_MODE === 'true' ? { otp } : {})
      });
    } else {
      return res.json({ success: true, exists: false });
    }
  } catch (err) {
    console.error('Check Email Error:', err.message);
    return res.status(500).json({ success: false, message: err.message || 'Failed to check email.' });
  }
};

export const registerUser = async (req, res) => {
  const email = req.body.email || req.body.Email;
  const name = req.body.name || req.body.Name;
  const phone = req.body.phone || req.body.Phone;
  const occupation = req.body.occupation || req.body.Occupation;
  const city = req.body.city || req.body.City;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existingUser = await User.findOne({ Email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email.' });
    }

    const otp = generateOTP();
    const newUser = new User({
      Email: normalizedEmail,
      Name: name || '',
      Phone: phone || '',
      Occupation: occupation || '',
      City: city || '',
      Balance: null,
      OTP: otp,
      OTPExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      LastLoginRequest: new Date()
    });

    await newUser.save();
    await sendOTPEmail(normalizedEmail, otp);

    return res.json({
      success: true,
      user: sanitizeUser(newUser),
      ...(process.env.DEVELOPMENT_MODE === 'true' ? { otp } : {})
    });
  } catch (err) {
    console.error('Register Error:', err.message);
    return res.status(500).json({ success: false, message: err.message || 'Registration failed.' });
  }
};

export const verifyOTP = async (req, res) => {
  const email = req.body.email || req.body.Email;
  const otp = req.body.otp || req.body.OTP;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const enteredOtp = otp.toString().trim();

  try {
    const user = await User.findOne({ Email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (!user.OTP || user.OTP.toString() !== enteredOtp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check your email and try again.' });
    }

    if (user.OTPExpires && new Date() > user.OTPExpires) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // OTP verified successfully
    user.OTP = null;
    user.OTPExpires = null;
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.Email }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({ success: true, user: sanitizeUser(user), token });
  } catch (err) {
    console.error('Verify OTP Error:', err.message);
    return res.status(500).json({ success: false, message: err.message || 'Verification failed.' });
  }
};

export const updateBalance = async (req, res) => {
  const userId = req.user?.id || req.body.userRowId;
  const { balance } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.Balance = Math.round(Number(balance) * 100) / 100;
    await user.save();

    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Update Balance Error:', err.message);
    return res.status(500).json({ success: false, message: err.message || 'Failed to update balance.' });
  }
};

export const updateProfile = async (req, res) => {
  const userId = req.user?.id || req.body.userRowId;
  const { Name, Phone, Occupation, City, Address, Zipcode, State, Country } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (Name !== undefined) user.Name = Name;
    if (Phone !== undefined) user.Phone = Phone;
    if (Occupation !== undefined) user.Occupation = Occupation;
    if (City !== undefined) user.City = City;
    if (Address !== undefined) user.Address = Address;
    if (Zipcode !== undefined) user.Zipcode = Zipcode;
    if (State !== undefined) user.State = State;
    if (Country !== undefined) user.Country = Country;

    await user.save();

    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Update Profile Error:', err.message);
    return res.status(500).json({ success: false, message: err.message || 'Failed to update profile.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (err) {
    console.error('Get Me Error:', err.message);
    return res.status(500).json({ success: false, message: err.message || 'Failed to retrieve user details.' });
  }
};
export default { checkEmail, registerUser, verifyOTP, updateBalance, updateProfile, getMe };
