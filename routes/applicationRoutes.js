import express from 'express'
import multer from 'multer'
import { submitApplication, getApplicationsByJob, getMyApplications, updateApplicationStatus, checkExistingApplication } from '../controllers/applicationController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()
const upload = multer({ dest: 'uploads/' }) 

router.post('/submit', protect, upload.single('resume'), submitApplication)
router.get('/job/:jobId', protect, getApplicationsByJob)
router.get('/my', protect, getMyApplications)
router.put('/:id/status', protect, updateApplicationStatus)
router.get('/check/:jobId', protect, checkExistingApplication)

export default router