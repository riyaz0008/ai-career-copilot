import express from 'express'
import cors from "cors"
import "dotenv/config";
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import assessmentQuestionRoutes from "./routes/assessmentQuestionRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";
import careerPathRoutes from "./routes/careerPathRoutes.js";
import skillGapRoutes from "./routes/skillGapRoutes.js";
import learningContentRoutes from "./routes/learningContentRoutes.js";
import userLearningProgressRoutes from "./routes/userLearningProgressRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import notificationPreferenceRoutes from "./routes/notificationPreferenceRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminSettingsRoutes from "./routes/adminSettingsRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import jobOfferRoutes from "./routes/jobOfferRoutes.js";
import offerChangeRequestRoutes from "./routes/offerChangeRequestRoutes.js";
import aiCareerAdvisorRoutes from "./routes/aiCareerAdvisorRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";


connectDB();

const app=express()
app.use(cors())
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({extended:true}))
app.use(userRoutes);
app.use(assessmentQuestionRoutes);
app.use(assessmentRoutes);
app.use(careerPathRoutes);
app.use(skillGapRoutes);
app.use(learningContentRoutes);
app.use(userLearningProgressRoutes);
app.use(dashboardRoutes);
app.use(progressRoutes);
app.use(notificationRoutes);
app.use(settingsRoutes);
app.use(notificationPreferenceRoutes);
app.use(adminRoutes);
app.use(adminSettingsRoutes);
app.use(adminDashboardRoutes);
app.use(companyRoutes);
app.use(jobRoutes);
app.use(resumeRoutes);
app.use(jobOfferRoutes);
app.use(offerChangeRequestRoutes);
app.use(aiCareerAdvisorRoutes);
app.use(interviewRoutes);

const PORT=process.env.PORT || 5000;
app.get('/',(req,res)=> {
    res.send('api is running')
})
app.listen(PORT,()=>console.log(`app is running on ${PORT}`));