
import express from 'express'
import passport from 'passport';
import { registerUser, loginUser } from '../controllers/authController.js'
import { getCurrentUser } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me', protect, getCurrentUser) 


router.get('/google/callback',
  passport.authenticate('google', {
      successRedirect: 'https://hirely-app-mocha.vercel.app/',
      failureRedirect: 'https://hirely-app-mocha.vercel.app/login'
    })
  );
  

router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

export default router
