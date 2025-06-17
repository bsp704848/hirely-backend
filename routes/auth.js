import express from 'express';
import passport from 'passport';
import { registerUser, loginUser } from '../controllers/authController.js';
import { getCurrentUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: true
}));

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: true
  }),
  (req, res) => {

    res.cookie('userId', req.user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none'
    });
    res.redirect('https://hirely-app-mocha.vercel.app/');
  }
);

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  res.json(req.user);
});

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('https://hirely-app-mocha.vercel.app/login');
    });
});

export default router;