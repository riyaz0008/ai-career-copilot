
import Job from "../models/Job.js";
import Company from "../models/Company.js";
import Notification from "../models/Notification.js";
import NotificationPreference from "../models/NotificationPreference.js";

// Check whether the logged-in company is approved
const getApprovedCompany = async (req, res) => {
    if (req.user?.role !== "recruiter") {
        res.status(403).json({
            message: "Company access required",
            status: 0
        });
        return null;
    }

    const company = await Company.findById(req.user.id);

    if (!company) {
        res.status(404).json({
            message: "Company not found",
            status: 0
        });
        return null;
    }

    if (company.verificationStatus !== "approved") {
        res.status(403).json({
            message: "Your company must be approved before posting jobs",
            status: 0
        });
        return null;
    }

    return company;
};

// Create a new job
export const createJob = async (req, res) => {
    try {
        const company = await getApprovedCompany(req, res);

        if (!company) return;

        const {
            title,
            department,
            jobType,
            workMode,
            location,
            salaryMin,
            salaryMax,
            experience,
            description,
            responsibilities,
            requiredSkills,
            education,
            applicationDeadline
        } = req.body;

        if (
            !title ||
            !jobType ||
            !workMode ||
            !location ||
            !experience ||
            !description ||
            !applicationDeadline ||
            !Array.isArray(requiredSkills) ||
            requiredSkills.length === 0
        ) {
            return res.status(400).json({
                message: "Please provide all required job details",
                status: 0
            });
        }

        const deadline = new Date(applicationDeadline);

        if (Number.isNaN(deadline.getTime()) || deadline <= new Date()) {
            return res.status(400).json({
                message: "Application deadline must be a future date",
                status: 0
            });
        }

        if (
            salaryMin != null &&
            salaryMax != null &&
            Number(salaryMin) > Number(salaryMax)
        ) {
            return res.status(400).json({
                message: "Minimum salary cannot exceed maximum salary",
                status: 0
            });
        }

        const job = await Job.create({
            companyId: company._id,
            title,
            department,
            jobType,
            workMode,
            location,
            salaryMin: salaryMin === "" || salaryMin == null
                ? null
                : Number(salaryMin),
            salaryMax: salaryMax === "" || salaryMax == null
                ? null
                : Number(salaryMax),
            experience,
            description,
            responsibilities: Array.isArray(responsibilities)
                ? responsibilities
                : [],
            requiredSkills: requiredSkills
                .map(skill => String(skill).trim())
                .filter(Boolean),
            education,
            applicationDeadline: deadline
        });
return res.status(201).json({
    message: "Job submitted successfully. Waiting for admin approval.",
    status: 1,
    data: job
});
    } catch (error) {
        console.error("Create Job Error:", error);

        return res.status(500).json({
            message: "Failed to post job",
            status: 0
        });
    }
};

// Get jobs posted by the logged-in company
export const getCompanyJobs = async (req, res) => {
    try {
        const company = await getApprovedCompany(req, res);

        if (!company) return;

        const jobs = await Job.find({
            companyId: company._id
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Company jobs fetched successfully",
            status: 1,
            data: jobs
        });
    } catch (error) {
        console.error("Get Company Jobs Error:", error);

        return res.status(500).json({
            message: "Failed to fetch company jobs",
            status: 0
        });
    }
};

// Update a job belonging to the logged-in company
export const updateJob = async (req, res) => {
    try {
        const company = await getApprovedCompany(req, res);

        if (!company) return;

        const job = await Job.findOne({
            _id: req.params.id,
            companyId: company._id
        });

        if (!job) {
            return res.status(404).json({
                message: "Job not found or access denied",
                status: 0
            });
        }

        const allowedFields = [
            "title",
            "department",
            "jobType",
            "workMode",
            "location",
            "salaryMin",
            "salaryMax",
            "experience",
            "description",
            "responsibilities",
            "requiredSkills",
            "education",
            "applicationDeadline",
            "status"
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                job[field] = req.body[field];
            }
        }

        if (
            job.salaryMin != null &&
            job.salaryMax != null &&
            job.salaryMin > job.salaryMax
        ) {
            return res.status(400).json({
                message: "Minimum salary cannot exceed maximum salary",
                status: 0
            });
        }

        if (
            !Array.isArray(job.requiredSkills) ||
            job.requiredSkills.filter(skill => String(skill).trim()).length === 0
        ) {
            return res.status(400).json({
                message: "At least one required skill must be added",
                status: 0
            });
        }

        if (
            !job.applicationDeadline ||
            Number.isNaN(new Date(job.applicationDeadline).getTime()) ||
            new Date(job.applicationDeadline) <= new Date()
        ) {
            return res.status(400).json({
                message: "Application deadline must be a future date",
                status: 0
            });
        }

        await job.save();

        return res.status(200).json({
            message: "Job updated successfully",
            status: 1,
            data: job
        });
    } catch (error) {
        console.error("Update Job Error:", error);

        return res.status(500).json({
            message: "Failed to update job",
            status: 0
        });
    }
};

// Delete a job belonging to the logged-in company
export const deleteJob = async (req, res) => {
    try {
        const company = await getApprovedCompany(req, res);

        if (!company) return;

        const job = await Job.findOneAndDelete({
            _id: req.params.id,
            companyId: company._id
        });

        if (!job) {
            return res.status(404).json({
                message: "Job not found or access denied",
                status: 0
            });
        }

        return res.status(200).json({
            message: "Job deleted successfully",
            status: 1
        });
    } catch (error) {
        console.error("Delete Job Error:", error);

        return res.status(500).json({
            message: "Failed to delete job",
            status: 0
        });
    }
};

// Public endpoint for viewing active jobs
// Public endpoint: show only approved and active jobs
export const getActiveJobs = async (req, res) => {
    try {
        const jobs = await Job.find({
            approvalStatus: "Approved",
            status: "Active",
            applicationDeadline: { $gt: new Date() }
        })
            .populate("companyId", "companyName website")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Approved active jobs fetched successfully",
            status: 1,
            data: jobs
        });
    } catch (error) {
        console.error("Get Active Jobs Error:", error);

        return res.status(500).json({
            message: "Failed to fetch active jobs",
            status: 0
        });
    }
};

// Admin: get all jobs for approval
export const getJobsForAdmin = async (req, res) => {
    try {
        if (req.user?.role !== "admin") {
            return res.status(403).json({
                message: "Admin access required",
                status: 0
            });
        }

        const jobs = await Job.find()
            .populate("companyId", "companyName email website verificationStatus")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Jobs fetched successfully",
            status: 1,
            data: jobs
        });
    } catch (error) {
        console.error("Get Jobs For Admin Error:", error);

        return res.status(500).json({
            message: "Failed to fetch jobs",
            status: 0
        });
    }
};

// Admin: approve or reject a job
// Admin: approve or reject a job
export const updateJobApproval = async (req, res) => {
    try {
        if (req.user?.role !== "admin") {
            return res.status(403).json({
                message: "Admin access required",
                status: 0
            });
        }

        const { approvalStatus } = req.body;

        if (!["Approved", "Rejected", "Pending"].includes(approvalStatus)) {
            return res.status(400).json({
                message: "Invalid approval status",
                status: 0
            });
        }

        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                status: 0
            });
        }

        // Store the previous status to prevent duplicate job alerts
        const previousApprovalStatus = job.approvalStatus;

        job.approvalStatus = approvalStatus;
        await job.save();

        // Notify users only when the job becomes approved
        if (
            approvalStatus === "Approved" &&
            previousApprovalStatus !== "Approved"
        ) {
            const preferences = await NotificationPreference.find({
                jobAlerts: true
            }).select("userId");

            if (preferences.length > 0) {
                const notifications = preferences.map((preference) => ({
                    userId: preference.userId,
                    title: "New Job Available",
                    message: `A new job "${job.title}" has been approved and is available to apply.`,
                    type: "job"
                }));

                await Notification.insertMany(notifications);
            }
        }

        return res.status(200).json({
            message: `Job ${approvalStatus.toLowerCase()} successfully`,
            status: 1,
            data: job
        });
    } catch (error) {
        console.error("Update Job Approval Error:", error);

        return res.status(500).json({
            message: "Failed to update job approval",
            status: 0
        });
    }
};