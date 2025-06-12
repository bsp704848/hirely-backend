import express from 'express';
import {
  getJobs,
  createJob,
  getJobById,
  deleteJob,
  updateJob,
  getJobsByEmployer
} from '../controllers/jobController.js';
import { protect } from '../middleware/authMiddleware.js'
import { getEmployerApplications } from '../controllers/applicationController.js';

const router = express.Router();


const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    error: "Internal server error" 
  });
};

router.post('/add', protect, createJob);   
router.get('/', getJobs); 
router.get('/:id', getJobById);       
router.delete('/:id', deleteJob);  
router.put('/:id', updateJob);   
router.get('/employer/my-jobs', protect, getJobsByEmployer);
router.get('/employer/applications', protect, getEmployerApplications);

router.use(errorHandler);

export default router;
