import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => { 
    
    const token = req.cookies.token;

    console.log('Token from cookie:', token);
    
    try {
        let token = null;

 
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
  
        if (!token && req.cookies?.token) {
            token = req.cookies.token;
            console.log('Token found in cookies:', token);
            
        }

        if (!token) {
            console.log('No token received in request');
            return res.status(401).json({ message: 'Not authorized, no token' });
        }
        console.log('Token received:', token);

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);
        
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(500).json({ message: 'Server error' });
    }
};

