import Application from '../models/Application.js';


export async function submitApplication(req, res) {
    try {
        // Validate required fields
        const {
            name,
            email,
            phone,
            birthdate,
            address,
            city,
            state,
            zip,
            position,
            employerName,
            startDate,
            hearAbout,
            coverLetter
        } = req.body;

        if (
            !name ||
            !email ||
            !phone ||
            !birthdate ||
            !address ||
            !city ||
            !state ||
            !zip ||
            !position ||
            !employerName ||
            !startDate ||
            !hearAbout ||
            !coverLetter
        ) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Validate name (letters and spaces only)
        if (!/^[A-Za-z\s]+$/.test(name)) {
            return res.status(400).json({ error: "Name must contain only letters and spaces" });
        }

        // Validate email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: "Invalid email address" });
        }

        // Validate phone (10 digits, starts with 6-9)
        if (!/^[6-9]\d{9}$/.test(phone)) {
            return res.status(400).json({ error: "Phone must be a valid 10 digit number" });
        }

        // Validate zip (6 digits, not starting with 0)
        if (!/^[1-9][0-9]{5}$/.test(zip)) {
            return res.status(400).json({ error: "Zip code must be a valid 6 digit number" });
        }

        // Validate city/state (letters and spaces only)
        if (!/^[A-Za-z\s]+$/.test(city)) {
            return res.status(400).json({ error: "City must contain only letters and spaces" });
        }
        if (!/^[A-Za-z\s]+$/.test(state)) {
            return res.status(400).json({ error: "State must contain only letters and spaces" });
        }

        // Validate address (letters, numbers, spaces)
        if (!/^[A-Za-z0-9\s,.-]+$/.test(address)) {
            return res.status(400).json({ error: "Address contains invalid characters" });
        }

        // Validate employerName (letters and spaces only)
        if (!/^[A-Za-z\s]+$/.test(employerName)) {
            return res.status(400).json({ error: "Employer name must contain only letters and spaces" });
        }

        // Validate coverLetter (not empty)
        if (!coverLetter.trim()) {
            return res.status(400).json({ error: "Cover letter is required" });
        }

        // Validate birthdate (must be 18+)
        const today = new Date();
        const dob = new Date(birthdate);
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        if (age < 18) {
            return res.status(400).json({ error: "You must be at least 18 years old to apply." });
        }

        const applicationData = {
            ...req.body,
            resume: req.file ? req.file.filename : null,
            appliedBy: req.user._id,
            employerName: req.body.employerName 
        }
        const application = new Application(applicationData)
        await application.save()
        res.status(201).json({ success: true, application })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

export async function getApplicationsByJob(req, res) {
    try {
        const applications = await Application.find({ position: req.params.jobId });
        res.json({ success: true, applications });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function getMyApplications(req, res) {
    try {
        const applications = await Application.find({ appliedBy: req.user._id })
            .populate('position'); // <-- Add this
        res.json({ success: true, applications });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}


export async function getEmployerApplications(req, res) {
    try {
        if (req.user.role !== 'employer') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        const jobs = await import('../models/job.js').then(m => m.default.find({ createdBy: req.user._id }));
        const jobIds = jobs.map(job => job._id);
        const applications = await import('../models/Application.js').then(m =>
            m.default.find({ position: { $in: jobIds } }).populate('position') // <-- Add populate here
        );
        res.json({ success: true, applications });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function updateApplicationStatus(req, res) {
  try {
    const { id } = req.params
    const { status } = req.body
    const updated = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('position')
    if (!updated) {
      return res.status(404).json({ message: 'Application not found' })
    }


    const io = req.app.get('io')
    io.emit('applicationStatusUpdated', updated) 

    res.json({ message: 'Status updated', application: updated })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}