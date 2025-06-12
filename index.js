import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jobRoutes from './routes/jobRoutes.js';
import authRoutes from './routes/auth.js'
import applicationRoutes from './routes/applicationRoutes.js'
import cookieParser from 'cookie-parser'
import path from 'path'
import fs from 'fs'

dotenv.config();
const app = express();
app.use(cors({
    origin: 'https://hirely-ten.vercel.app',
    credentials: true, 
  }));
app.use(express.json());
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);


app.get('/uploads/:filename', (req, res, next) => {
    const filePath = path.join(process.cwd(), 'uploads', req.params.filename)
    if (fs.existsSync(filePath)) {
      
        if (filePath.endsWith('.pdf')) {
            res.setHeader('Content-Type', 'application/pdf')
            res.setHeader('Content-Disposition', 'inline')
        }
        fs.createReadStream(filePath).pipe(res)
    } else {
        next() 
    }
})


app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("MongoDB connected");
    app.listen(3000, () => console.log("Server running on port 3000"));
}).catch(err => console.log(err));
