import { Schema, model } from "mongoose";

const jobSchema = new Schema({
    jobCategory:String,
    jobType: String,
    jobTitle: String,
    jobDetails: String,
    salary: {
        min: Number,
        max: Number,
    },
    experience: String,
    vacancy:Number,
    company: {
        companyName: String,
        location: String,
        companyDetails: String,
        contactEmail: String,
        contactPhone: String,
    },
    postedAt: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
});

export default model("Job", jobSchema);

