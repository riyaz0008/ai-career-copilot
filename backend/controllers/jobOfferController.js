
import mongoose from "mongoose";
import JobOffer from "../models/JobOffer.js";
import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";
import Company from "../models/Company.js";

const getApprovedCompany = async (req) => {
    if (
        req.user?.role !== "recruiter" ||
        !mongoose.isValidObjectId(req.user?.id)
    ) {
        return null;
    }

    return Company.findOne({
        _id: req.user.id,
        verificationStatus: "approved"
    });
};

// Company: send an offer to an accepted candidate
export const sendJobOffer = async (req, res) => {
    try {
        const company = await getApprovedCompany(req);

        if (!company) {
            return res.status(403).json({
                message: "Only approved companies can send job offers.",
                status: 0
            });
        }

        const { applicationId } = req.params;
        const {
            salary,
            salaryPeriod = "Monthly",
            joiningDate,
            workLocation,
            offerDetails
        } = req.body;

        if (!mongoose.isValidObjectId(applicationId)) {
            return res.status(400).json({
                message: "Invalid application ID.",
                status: 0
            });
        }

        const parsedSalary = Number(salary);
        const parsedJoiningDate = new Date(joiningDate);

        if (
            salary === "" ||
            salary === undefined ||
            !Number.isFinite(parsedSalary) ||
            parsedSalary <= 0
        ) {
            return res.status(400).json({
                message: "Enter a valid salary greater than zero.",
                status: 0
            });
        }

        if (!["Monthly", "Yearly"].includes(salaryPeriod)) {
            return res.status(400).json({
                message: "Invalid salary period.",
                status: 0
            });
        }

        if (
            !joiningDate ||
            Number.isNaN(parsedJoiningDate.getTime()) ||
            parsedJoiningDate <= new Date()
        ) {
            return res.status(400).json({
                message: "Joining date must be in the future.",
                status: 0
            });
        }

        if (
            !workLocation?.trim() ||
            !offerDetails?.trim()
        ) {
            return res.status(400).json({
                message: "Work location and offer details are required.",
                status: 0
            });
        }

        const application = await JobApplication.findOne({
            _id: applicationId,
            companyId: company._id,
            status: "Accepted"
        });

        if (!application) {
            return res.status(404).json({
                message: "An accepted application for your company was not found.",
                status: 0
            });
        }

        const job = await Job.findOne({
            _id: application.jobId,
            companyId: company._id
        });

        if (!job) {
            return res.status(404).json({
                message: "The job linked to this application was not found.",
                status: 0
            });
        }

        const existingOffer = await JobOffer.findOne({
            applicationId: application._id
        });

        if (existingOffer) {
            return res.status(409).json({
                message: "An offer already exists for this application.",
                status: 0,
                data: existingOffer
            });
        }

        const offer = await JobOffer.create({
            jobId: application.jobId,
            applicationId: application._id,
            companyId: company._id,
            userId: application.userId,
            salary: parsedSalary,
            salaryPeriod,
            joiningDate: parsedJoiningDate,
            workLocation: workLocation.trim(),
            offerDetails: offerDetails.trim(),
            status: "Offer Sent"
        });

        return res.status(201).json({
            message: "Job offer sent successfully.",
            status: 1,
            data: offer
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "An offer already exists for this application.",
                status: 0
            });
        }

        console.error("Send Job Offer Error:", error);

        return res.status(500).json({
            message: "Failed to send job offer.",
            status: 0
        });
    }
};

// Company: view offers sent by its own account
export const getCompanyJobOffers = async (req, res) => {
    try {
        const company = await getApprovedCompany(req);

        if (!company) {
            return res.status(403).json({
                message: "Only approved companies can view job offers.",
                status: 0
            });
        }

        const offers = await JobOffer.find({
            companyId: company._id
        })
            .populate({
                path: "jobId",
                select: "title jobType workMode location"
            })
            .populate({
                path: "userId",
                select: "firstname lastname email"
            })
            .populate({
                path: "applicationId",
                select: "status"
            })
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            message: "Company offers fetched successfully.",
            status: 1,
            data: offers
        });
    } catch (error) {
        console.error("Get Company Job Offers Error:", error);

        return res.status(500).json({
            message: "Failed to fetch company offers.",
            status: 0
        });
    }
};

// Candidate: view their own offers
export const getMyJobOffers = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (
            !userId ||
            req.user?.role === "recruiter" ||
            !mongoose.isValidObjectId(userId)
        ) {
            return res.status(403).json({
                message: "Please log in with a candidate account.",
                status: 0
            });
        }

        const offers = await JobOffer.find({ userId })
            .populate({
                path: "jobId",
                select: "title jobType workMode location"
            })
            .populate({
                path: "companyId",
                select: "companyName"
            })
            .select(
                "jobId applicationId companyId userId salary salaryPeriod joiningDate workLocation offerDetails status candidateResponseAt respondedAt createdAt updatedAt"
            )
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            message: "Your job offers fetched successfully.",
            status: 1,
            data: offers
        });
    } catch (error) {
        console.error("Get My Job Offers Error:", error);

        return res.status(500).json({
            message: "Failed to fetch your job offers.",
            status: 0
        });
    }
};
// Candidate: accept or decline their own offer
export const respondToJobOffer = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (
            !userId ||
            req.user?.role === "recruiter" ||
            !mongoose.isValidObjectId(userId)
        ) {
            return res.status(403).json({
                message: "Please log in with a candidate account.",
                status: 0
            });
        }

        const { offerId } = req.params;
        const { response } = req.body;

        if (!mongoose.isValidObjectId(offerId)) {
            return res.status(400).json({
                message: "Invalid offer ID.",
                status: 0
            });
        }

        if (
            !["Offer Accepted", "Offer Declined"].includes(response)
        ) {
            return res.status(400).json({
                message: "Response must be Offer Accepted or Offer Declined.",
                status: 0
            });
        }

        const offer = await JobOffer.findOne({
            _id: offerId,
            userId
        });

        if (!offer) {
            return res.status(404).json({
                message: "Job offer not found.",
                status: 0
            });
        }

        if (offer.status !== "Offer Sent") {
            return res.status(400).json({
                message: "This offer has already received a response or is no longer active.",
                status: 0
            });
        }

        const responseDate = new Date();

        offer.status = response;
        offer.candidateResponseAt = responseDate;
        offer.respondedAt = responseDate;

        await offer.save();

        return res.status(200).json({
            message:
                response === "Offer Accepted"
                    ? "You accepted the job offer."
                    : "You declined the job offer.",
            status: 1,
            data: offer
        });
    } catch (error) {
        console.error("Respond To Job Offer Error:", error);

        return res.status(500).json({
            message: "Failed to submit your offer response.",
            status: 0
        });
    }
};