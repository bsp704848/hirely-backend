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
import { Server } from 'socket.io'
import http from 'http'


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://hirely-app-mocha.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
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
}).catch(err => console.log(err));

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://hirely-app-mocha.vercel.app'
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
})

io.on('connection', (socket) => {
  console.log('A client connected:', socket.id)
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

app.set('io', io)

server.listen(PORT, () => {
  console.log('Server running on port 3000')
})
