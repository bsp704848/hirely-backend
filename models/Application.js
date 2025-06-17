import { Schema, model } from "mongoose";

const applicationSchema = new Schema({
    name: String,
    email: String,
    phone: String,
    birthdate: Date,
    address: String,
    city: String,
    state: String,
    zip: String,
    position: {
        type: Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    employerName: String,
    startDate: Date,
    hearAbout: String,
    coverLetter: String,
    resume: String, 
    appliedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['applied', 'interview', 'selected', 'rejected'],
        default: 'applied'
    }
}, { timestamps: true });

applicationSchema.index({ appliedBy: 1, position: 1 }, { unique: true });


export default model('Application', applicationSchema);
