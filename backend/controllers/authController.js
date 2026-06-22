import User from '../models/User.js';
import { sendOTPEmail } from '../utils/mailer.js';

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
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
        user,
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
      Balance: 0,
      OTP: otp,
      OTPExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      LastLoginRequest: new Date()
    });

    await newUser.save();
    await sendOTPEmail(normalizedEmail, otp);

    return res.json({
      success: true,
      user: newUser,
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

    return res.json({ success: true, user });
  } catch (err) {
    console.error('Verify OTP Error:', err.message);
    return res.status(500).json({ success: false, message: err.message || 'Verification failed.' });
  }
};

export const updateBalance = async (req, res) => {
  const { userRowId, balance } = req.body;
  if (!userRowId) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  try {
    const user = await User.findById(userRowId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.Balance = Number(balance);
    await user.save();

    return res.json({ success: true, user });
  } catch (err) {
    console.error('Update Balance Error:', err.message);
    return res.status(500).json({ success: false, message: err.message || 'Failed to update balance.' });
  }
};

export const updateProfile = async (req, res) => {
  const { userRowId, Name, Phone, Occupation, City, Address, Zipcode, State, Country } = req.body;
  if (!userRowId) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  try {
    const user = await User.findById(userRowId);
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

    return res.json({ success: true, user });
  } catch (err) {
    console.error('Update Profile Error:', err.message);
    return res.status(500).json({ success: false, message: err.message || 'Failed to update profile.' });
  }
};
export default { checkEmail, registerUser, verifyOTP, updateBalance, updateProfile };
