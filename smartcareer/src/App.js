
import './App.css';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import AuthRoute from './AuthRoute';
import AdminRoute from './AdminRoute';
import CompanyRoute from "./CompanyRoute";

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Features = lazy(() => import('./pages/Features'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Forgetpass = lazy(() => import('./pages/Forgetpass'));

const UserDashboard = lazy(() => import('./user-dash/UserDashboard'));
const AdminDashboard = lazy(() => import('./admin-dash/AdminDashboard'));

const MyProfile = lazy(() => import('./user-pages/MyProfile'));
const CareerAssessment = lazy(() => import('./user-pages/CareerAssessment'));
const CareerRecommendations = lazy(() => import('./user-pages/CareerRecommendations'));
const CareerPathDetails = lazy(() => import('./user-pages/CareerPathDetails'));
const LearningResources = lazy(() => import('./user-pages/LearningResources'));
const SkillGap = lazy(() => import('./user-pages/SkillGap'));
const CareerRoadmap = lazy(() => import('./user-pages/CareerRoadmap'));
const MyProgress = lazy(() => import('./user-pages/MyProgress'));
const Notifications = lazy(() => import('./user-pages/Notifications'));
const Settings = lazy(() => import('./user-pages/Settings'));
const BrowseJobs = lazy(() => import("./user-pages/BrowseJobs"));
const ApplyJob = lazy(() => import("./user-pages/ApplyJob"));
const Resume = lazy(() => import("./user-pages/Resume"));
const MyApplications = lazy(() => import("./user-pages/MyApplications"));
const MyJobOffers = lazy(() => import("./user-pages/MyJobOffers"));
const AICareerAdvisor = lazy(() => import("./user-pages/AICareerAdvisor"));
const InterviewPreparation = lazy(() => import("./user-pages/InterviewPreparation"));
const InterviewSession = lazy(() => import("./user-pages/InterviewSession"));

const AdminQuestions = lazy(() => import('./admin-pages/AdminQuestions'));
const AdminAssessments = lazy(() => import('./admin-pages/AdminAssessments'));
const AssessmentDetails = lazy(() => import('./admin-pages/AssessmentDetails'));
const AdminCareerPaths = lazy(() => import('./admin-pages/AdminCareerPaths'));
const LearningContent = lazy(() => import('./admin-pages/LearningContent'));
const AdminUsers = lazy(() => import('./admin-pages/AdminUsers'));
const AdminSettings = lazy(() => import('./admin-pages/AdminSettings'));
const CompanyVerification = lazy(() => import('./admin-pages/CompanyVerification'));
const JobApproval = lazy(() => import("./admin-pages/JobApproval"));
const ManageInterviewQuestions = lazy(() => import("./admin-pages/ManageInterviewQuestions"));

const CompanyRegister = lazy(() => import('./pages/CompanyRegister'));
const CompanyLogin = lazy(() => import('./pages/CompanyLogin'));
const CompanyDashboard = lazy(() => import("./company-pages/CompanyDashboard"));
const PostJob = lazy(() => import("./company-pages/PostJob"));
const ManageJobs = lazy(() => import("./company-pages/ManageJobs"));
const CompanyApplications = lazy(() => import("./company-pages/CompanyApplications"));
const CompanyOfferChangeRequests = lazy(() => import("./company-pages/CompanyOfferChangeRequests"));
const CompanyProfile = lazy(() => import('./company-pages/CompanyProfile'));


function App() {
    return (
        <div className="App">
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/features" element={<Features />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<Forgetpass />} />

                    <Route path="/browse-jobs" element={<BrowseJobs />} />
                    <Route path="/apply-job/:jobId" element={<ApplyJob />} />
                    <Route path="/resume" element={<Resume />} />
                    <Route path="/my-applications"element={<MyApplications />}/>
                    <Route path="/my-job-offers" element={<MyJobOffers />} />
                    <Route path="/ai-career-advisor" element={<AuthRoute><AICareerAdvisor /></AuthRoute>}/>
                    <Route path="/interview-preparation" element={<AuthRoute><InterviewPreparation /></AuthRoute>}/>
                    <Route path="/interview-session" element={<AuthRoute><InterviewSession /></AuthRoute> }/>
                    <Route
                        path="/user-dashboard"
                        element={<AuthRoute><UserDashboard /></AuthRoute>}
                    />
                    <Route
                        path="/my-profile"
                        element={<AuthRoute><MyProfile /></AuthRoute>}
                    />
                    <Route
                        path="/career-assessment"
                        element={<AuthRoute><CareerAssessment /></AuthRoute>}
                    />
                    <Route
                        path="/career-recommendations"
                        element={<AuthRoute><CareerRecommendations /></AuthRoute>}
                    />
                    <Route
                        path="/career-path/:id"
                        element={<AuthRoute><CareerPathDetails /></AuthRoute>}
                    />
                    <Route
                        path="/learning-resources"
                        element={<AuthRoute><LearningResources /></AuthRoute>}
                    />
                    <Route
                        path="/skill-gap"
                        element={<AuthRoute><SkillGap /></AuthRoute>}
                    />
                    <Route
                        path="/career-roadmap"
                        element={<AuthRoute><CareerRoadmap /></AuthRoute>}
                    />
                    <Route
                        path="/progress"
                        element={<AuthRoute><MyProgress /></AuthRoute>}
                    />
                    <Route
                        path="/notifications"
                        element={<AuthRoute><Notifications /></AuthRoute>}
                    />
                    <Route
                        path="/settings"
                        element={<AuthRoute><Settings /></AuthRoute>}
                    />

                    <Route
                        path="/admin-dashboard"
                        element={<AdminRoute><AdminDashboard /></AdminRoute>}
                    />
                    <Route path="/admin-interview-questions" element={<AdminRoute><ManageInterviewQuestions /></AdminRoute>}/>
                    <Route
                        path="/admin-users"
                        element={<AdminRoute><AdminUsers /></AdminRoute>}
                    />
                    <Route
                        path="/admin-questions"
                        element={<AdminRoute><AdminQuestions /></AdminRoute>}
                    />

                    <Route
                        path="/admin-assessments"
                        element={<AdminRoute><AdminAssessments /></AdminRoute>}
                    />
                    <Route
                        path="/admin-assessments/:aid"
                        element={<AdminRoute><AssessmentDetails /></AdminRoute>}
                    />
                    <Route
                        path="/admin-career-paths"
                        element={<AdminRoute><AdminCareerPaths /></AdminRoute>}
                    />
                    <Route
                        path="/admin/learning-content"
                        element={<AdminRoute><LearningContent /></AdminRoute>}
                    />
                    <Route
                        path="/admin-settings"
                        element={<AdminRoute><AdminSettings /></AdminRoute>}
                    />
                    <Route
                        path="/admin-companies"
                        element={<AdminRoute><CompanyVerification /></AdminRoute>}
                    />
                    <Route path="/admin-job-approval" element={<AdminRoute><JobApproval /></AdminRoute>} />

                    <Route path="/company-register" element={<CompanyRegister />} />
                    <Route path="/company-login" element={<CompanyLogin />} />
                    <Route path="/company-dashboard" element={<CompanyRoute><CompanyDashboard /> </CompanyRoute>}/>
                    <Route path="/company-post-job" element={<CompanyRoute> <PostJob /> </CompanyRoute>} />
                    <Route path="/company-manage-jobs" element={<CompanyRoute> <ManageJobs /> </CompanyRoute>} />
                    <Route path="/company-applications" element={<CompanyRoute> <CompanyApplications /> </CompanyRoute>}/>
                    <Route path="/company-offer-change-requests" element={<CompanyRoute> <CompanyOfferChangeRequests /> </CompanyRoute>}/>
                    <Route path="/company-profile" element={<CompanyRoute><CompanyProfile /></CompanyRoute>}/>
                </Routes>
            </Suspense>
        </div>
    );
}

export default App;