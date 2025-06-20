
import express from 'express'
import { registerUser, loginUser, getCurrentUser } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'
import { googleLogin } from '../controllers/authController.js'


const router = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me', protect, getCurrentUser)
router.post('/google', googleLogin)


router.get('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
  });
  return res.status(200).json({ message: 'Logged out successfully' });
});


export default router
