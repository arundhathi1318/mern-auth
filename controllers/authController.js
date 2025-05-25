import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../Models/userModel.js';
import transporter from '../config/nodemailer.js';

// Register Controller
export const registered = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: 'Missing details' });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Sending welcome email
    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: "Welcome to GreatStack",
        text: `Welcome to greatstack website. Your account has been created with email id: ${email}`,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
    }

    return res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Login Controller
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: 'Email and Password are required' });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: 'Invalid Email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid Password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, message: 'Login successful' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Logout Controller
export const logOut = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });

    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Send Verification OTP Controller
export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account Already verified" });
    }

    // Generate OTP (6-digit number)
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyotp = otp;
    user.verifyotpexpireat = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // Send OTP email
    try {
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: user.email, // Fixed: use user.email instead of undefined 'email'
        subject: "Account Verification OTP",
        text: `YOUR OTP IS: ${otp}`, // Fixed typo: "YOR" -> "YOUR"
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
      return res.json({ success: false, message: "Failed to send OTP email" });
    }

    res.json({ success: true, message: 'Verification OTP sent on email' });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};