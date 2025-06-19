
import express from 'express'
import passport from 'passport';
import { registerUser, loginUser, getCurrentUser } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'
import jwt from 'jsonwebtoken';

const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me', protect, getCurrentUser)


router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
    session: false
  }),
  async (req, res) => {
    try {

      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });


      console.log(`✅ Google Auth: Token created and cookie set for user ${req.user.email}`);


      res.redirect(`${process.env.FRONTEND_URL}/`);

    } catch (error) {
      console.error('Google Auth Callback Error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login`);
    }
  }
);



router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

export default router
