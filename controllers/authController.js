import User from '../models/User.js'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library' 

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export const registerUser = async (req, res) => {
  const { username, email, password, role } = req.body


  if (!username || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }


  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

 
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        'Password must be at least 8 characters, include uppercase, lowercase, number, and special character',
    });
  }

  try {
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' })
    }


    const newUser = await User.create({ username, email, password, role })

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },

    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}



export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login request received:', { email, password });

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', user); 
      return res.status(400).json({ message: 'Invalid credentials' });
    }


    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d', 
    });

  
    return res.status(200).json({
      message: 'Login success',
      token, 
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
}; 

export const googleLogin = async (req, res) => {
  const { token } = req.body

  if (!token) {
    return res.status(400).json({ message: 'Google token missing' })
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    console.log('Token:', token)
    console.log('Expected Audience:', process.env.GOOGLE_CLIENT_ID)

    const payload = ticket.getPayload()

    const { sub: googleId, email, name, picture } = payload


    let user = await User.findOne({ email })

    if (!user) {
      user = await User.create({
        username: name,
        email, 
        role: 'employee', 
        googleId,
        profilePic: picture,
      })
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    })

    res.status(200).json({
      message: 'Google login successful',
      token: jwtToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
      },
    })
  } catch (error) {
    console.error('Google Login Error:', error.message)
    res.status(401).json({ message: 'Invalid Google token' })
  }
}



export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

