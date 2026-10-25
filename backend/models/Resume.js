import mongoose from "mongoose";

const educationSchema = new mongoose.Schema(
    {
        degree: { type: String, default: "" },
        institution: { type: String, default: "" },
        year: { type: String, default: "" },
        grade: { type: String, default: "" }
    },
    { _id: false }
);

const experienceSchema = new mongoose.Schema(
    {
        position: { type: String, default: "" },
        company: { type: String, default: "" },
        duration: { type: String, default: "" },
        description: { type: String, default: "" }
    },
    { _id: false }
);

const projectSchema = new mongoose.Schema(
    {
        title: { type: String, default: "" },
        description: { type: String, default: "" },
        technologies: { type: String, default: "" },
        projectUrl: { type: String, default: "" }
    },
    { _id: false }
);

const resumeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
            unique: true
        },

        // Resume source: website builder or uploaded PDF
        source: {
            type: String,
            enum: ["builder", "upload"],
            default: "upload"
        },

        fileUrl: {
    type: String,
    default: ""
},
filePublicId: {
    type: String,
    default: ""
},
fileResourceType: {
    type: String,
    default: "raw"
},
        // Uploaded PDF details
        fileName: {
            type: String,
            default: ""
        },
        filePath: {
            type: String,
            default: ""
        },
        fileSize: {
            type: Number,
            default: 0
        },
        uploadedAt: {
            type: Date,
            default: null
        },

        // Resume Builder details
        personalInfo: {
            fullName: { type: String, default: "" },
            email: { type: String, default: "" },
            phone: { type: String, default: "" },
            address: { type: String, default: "" },
            linkedIn: { type: String, default: "" },
            portfolio: { type: String, default: "" }
        },
       photo: {
    type: String,
    default: ""
},
photoPublicId: {
    type: String,
    default: ""
},
        objective: {
            type: String,
            default: ""
        },

        education: {
            type: [educationSchema],
            default: []
        },

        skills: {
            type: [String],
            default: []
        },

        experience: {
            type: [experienceSchema],
            default: []
        },

        projects: {
            type: [projectSchema],
            default: []
        },

        certifications: {
            type: [String],
            default: []
        },

        template: {
            type: String,
            enum: ["classic", "modern"],
            default: "modern"
        }
    },
    { timestamps: true }
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;