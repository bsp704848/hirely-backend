import Job from "../models/job.js";

export async function getJobs(req, res) {
    try {
        const jobs = await Job.find().sort({ postedAt: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: "Server error while fetching jobs" });
    }
}

export async function createJob(req, res) {
    try {
    
        const {
            jobCategory,
            jobType,
            jobTitle,
            vacancy,
            company
        } = req.body;

        if (
            !jobCategory ||
            !jobType ||
            !jobTitle ||
            !company ||
            !company.companyName ||
            !company.location ||
            !company.contactEmail
        ) {
            return res.status(400).json({ error: "Missing required fields" });
        }

  
        if (!/^[A-Za-z\s]+$/.test(jobTitle)) {
            return res.status(400).json({ error: "Job title must contain only letters and spaces" });
        }

        if (!/^[A-Za-z\s]+$/.test(company.companyName)) {
            return res.status(400).json({ error: "Company name must contain only letters and spaces" });
        }

      
        if (!/^[A-Za-z\s]+$/.test(company.location)) {
            return res.status(400).json({ error: "Location must contain only letters and spaces" });
        }

  
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(company.contactEmail)) {
            return res.status(400).json({ error: "Invalid contact email address" });
        }

     
        if (company.contactPhone && !/^[6-9]\d{9}$/.test(company.contactPhone)) {
            return res.status(400).json({ error: "Contact phone must be a valid 10 digit number" });
        }

        if (vacancy && (isNaN(vacancy) || vacancy < 0)) {
            return res.status(400).json({ error: "Vacancy must be a positive number" });
        }

        const newJob = new Job({
            ...req.body,
            createdBy: req.user._id
        });
        await newJob.save();
        res.status(201).json({
            success: true,
            message: "Job created successfully",
            job: newJob,
        });
    } catch (err) {
        res.status(400).json({ error: "Error creating job", details: err.message });
    }
}

export async function getJobById(req, res) {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ error: "Job not found" });
        res.json(job);
    } catch (err) {
        res.status(500).json({ error: "Error fetching job by ID" });
    }
}

export async function updateJob(req, res) {
    try {
        const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
            new: true,       
            runValidators: true  
        });

        if (!job) return res.status(404).json({ error: "Job not found" });

        res.json({
            success: true,
            message: "Job updated successfully",
            job
        });
    } catch (err) {
        res.status(400).json({ error: "Error updating job" });
    }
}


export async function deleteJob(req, res) {
    try {
        await Job.findByIdAndDelete(req.params.id);
        res.json({ message: "Job deleted" });
    } catch (err) {
        res.status(500).json({ error: "Error deleting job" });
    }
}

export async function getJobsByEmployer(req, res) {
    try {
        // Only allow if user is employer/admin
        if (req.user.role !== 'employer') {
            return res.status(403).json({ error: "Forbidden: Only employers can view their jobs" });
        }
        const jobs = await Job.find({ createdBy: req.user._id });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: "Server error while fetching employer jobs" });
    }
}
