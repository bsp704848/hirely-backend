import User from '../models/User.js'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'

//registerUser
export const registerUser = async (req, res) => {
  const { username, email, password, role } = req.body

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


//loginUser
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
      expiresIn: '7d', // Token expires in 7 days
    });

  
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000, 
      })
      .status(200)
      .json({
        token,
        message: 'Login success',
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

