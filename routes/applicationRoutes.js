import express from 'express'
import multer from 'multer'
import { submitApplication, getApplicationsByJob, getMyApplications, updateApplicationStatus } from '../controllers/applicationController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()
const upload = multer({ dest: 'uploads/' }) 

router.post('/submit', authMiddleware, upload.single('resume'), submitApplication)
router.get('/job/:jobId', authMiddleware, getApplicationsByJob)
router.get('/my', authMiddleware, getMyApplications)
router.patch('/status/:id', authMiddleware, updateApplicationStatus)

export default router