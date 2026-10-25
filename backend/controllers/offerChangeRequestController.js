
import mongoose from "mongoose";
import OfferChangeRequest from "../models/OfferChangeRequest.js";
import JobOffer from "../models/JobOffer.js";
import Company from "../models/Company.js";

export const createOfferChangeRequest = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { offerId } = req.params;
        const {
            requestType,
            expectedSalary,
            joiningDate,
            workLocation,
            workingHours,
            message
        } = req.body;

        if (
            !userId ||
            req.user?.role === "recruiter" ||
            !mongoose.isValidObjectId(userId)
        ) {
            return res.status(403).json({
                status: 0,
                message: "Please login with a candidate account."
            });
        }

        if (!mongoose.isValidObjectId(offerId)) {
            return res.status(400).json({
                status: 0,
                message: "Invalid offer ID."
            });
        }

        const validTypes = [
            "Salary",
            "Joining Date",
            "Work Location",
            "Working Hours",
            "Benefits",
            "Other"
        ];

        if (!validTypes.includes(requestType)) {
            return res.status(400).json({
                status: 0,
                message: "Select a valid request type."
            });
        }

        if (!message?.trim() || message.trim().length < 5) {
            return res.status(400).json({
                status: 0,
                message: "Please explain your request in at least 5 characters."
            });
        }

        if (message.trim().length > 1500) {
            return res.status(400).json({
                status: 0,
                message: "Message cannot exceed 1500 characters."
            });
        }

        const offer = await JobOffer.findOne({
            _id: offerId,
            userId
        });

        if (!offer) {
            return res.status(404).json({
                status: 0,
                message: "Your job offer was not found."
            });
        }

        if (offer.status !== "Offer Sent") {
            return res.status(400).json({
                status: 0,
                message: "Only an active offer can receive a change request."
            });
        }

        const existingRequest = await OfferChangeRequest.findOne({
            offerId: offer._id,
            userId,
            status: "Pending"
        });

        if (existingRequest) {
            return res.status(409).json({
                status: 0,
                message: "You already have a pending request for this offer.",
                data: existingRequest
            });
        }

        const requestData = {
            offerId: offer._id,
            applicationId: offer.applicationId,
            companyId: offer.companyId,
            userId,
            requestType,
            message: message.trim()
        };

        if (requestType === "Salary") {
            const salary = Number(expectedSalary);

            if (
                expectedSalary === undefined ||
                expectedSalary === "" ||
                !Number.isFinite(salary) ||
                salary <= 0
            ) {
                return res.status(400).json({
                    status: 0,
                    message: "Enter a valid expected salary."
                });
            }

            requestData.expectedSalary = salary;
        }

        if (requestType === "Joining Date") {
            const date = new Date(joiningDate);

            if (
                !joiningDate ||
                Number.isNaN(date.getTime()) ||
                date <= new Date()
            ) {
                return res.status(400).json({
                    status: 0,
                    message: "Select a valid future joining date."
                });
            }

            requestData.joiningDate = date;
        }

        if (requestType === "Work Location") {
            if (!workLocation?.trim()) {
                return res.status(400).json({
                    status: 0,
                    message: "Enter your preferred work location or mode."
                });
            }

            requestData.workLocation = workLocation.trim();
        }

        if (requestType === "Working Hours") {
            if (!workingHours?.trim()) {
                return res.status(400).json({
                    status: 0,
                    message: "Enter your preferred working hours."
                });
            }

            requestData.workingHours = workingHours.trim();
        }

        const changeRequest = await OfferChangeRequest.create(requestData);

        return res.status(201).json({
            status: 1,
            message: "Your offer change request was submitted successfully.",
            data: changeRequest
        });
    } catch (error) {
        console.error("Create Offer Change Request Error:", error);

        return res.status(500).json({
            status: 0,
            message: "Failed to submit your offer change request."
        });
    }
};

export const getMyOfferChangeRequests = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (
            !userId ||
            req.user?.role === "recruiter" ||
            !mongoose.isValidObjectId(userId)
        ) {
            return res.status(403).json({
                status: 0,
                message: "Please login with a candidate account."
            });
        }

        const requests = await OfferChangeRequest.find({ userId })
            .populate({
                path: "offerId",
                select: "salary salaryPeriod joiningDate workLocation offerDetails status"
            })
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            status: 1,
            message: "Offer change requests fetched successfully.",
            data: requests
        });
    } catch (error) {
        console.error("Get My Offer Change Requests Error:", error);

        return res.status(500).json({
            status: 0,
            message: "Failed to fetch your offer change requests."
        });
    }
};
export const getCompanyOfferChangeRequests = async (req, res) => {
    try {
        const companyId = req.user?.id;

        if (
            req.user?.role !== "recruiter" ||
            !mongoose.isValidObjectId(companyId)
        ) {
            return res.status(403).json({
                status: 0,
                message: "Company access required."
            });
        }

        const company = await Company.findOne({
            _id: companyId,
            verificationStatus: "approved"
        });

        if (!company) {
            return res.status(403).json({
                status: 0,
                message: "Only approved companies can view these requests."
            });
        }

        const changeRequests = await OfferChangeRequest.find({
            companyId: company._id
        })
            .populate({
                path: "offerId",
                select: "salary salaryPeriod joiningDate workLocation status offerDetails jobId"
            })
            .populate({
                path: "userId",
                select: "firstname lastname email"
            })
            .populate({
                path: "applicationId",
                populate: {
                    path: "jobId",
                    select: "title"
                }
            })
            .sort({ createdAt: -1 })
            .lean();

        const respondedOffers = await JobOffer.find({
            companyId: company._id,
            status: {
                $in: ["Offer Accepted", "Offer Declined"]
            }
        })
            .populate({
                path: "jobId",
                select: "title"
            })
            .populate({
                path: "userId",
                select: "firstname lastname email"
            })
            .populate({
                path: "applicationId",
                populate: {
                    path: "jobId",
                    select: "title"
                }
            })
            .lean();

        // Use offer ID as the unique key to prevent duplicate cards.
        const byOffer = new Map();

        for (const request of changeRequests) {
            const offerId = String(
                request.offerId?._id || request.offerId || ""
            );

            if (!offerId) continue;

            const offerStatus = request.offerId?.status;
            const isFinalOfferResponse = [
                "Offer Accepted",
                "Offer Declined"
            ].includes(offerStatus);

            const status = isFinalOfferResponse
                ? offerStatus
                : request.status;

            byOffer.set(offerId, {
                ...request,
                requestStatus: request.status,
                status,
                displayMessage: status === "Offer Accepted"
                    ? "Offer Accepted"
                    : status === "Offer Declined"
                        ? "Offer Rejected"
                        : request.message,
                _sortDate: request.updatedAt || request.createdAt
            });
        }

        for (const offer of respondedOffers) {
            const offerId = String(offer._id);
            const existing = byOffer.get(offerId);

            const displayMessage =
                offer.status === "Offer Accepted"
                    ? "Offer Accepted"
                    : "Offer Rejected";

            if (existing) {
                existing.status = offer.status;
                existing.displayMessage = displayMessage;
                existing.offerId = offer;
                existing.userId = offer.userId || existing.userId;
                existing.applicationId =
                    offer.applicationId || existing.applicationId;
                existing._sortDate = offer.updatedAt || offer.createdAt;
            } else {
                byOffer.set(offerId, {
                    _id: `offer-${offerId}`,
                    offerId: offer,
                    applicationId: offer.applicationId,
                    userId: offer.userId || {},
                    companyId: offer.companyId,
                    requestType: "Offer Response",
                    message: "",
                    displayMessage,
                    status: offer.status,
                    requestStatus: offer.status,
                    createdAt: offer.createdAt,
                    respondedAt: offer.updatedAt,
                    _sortDate: offer.updatedAt || offer.createdAt
                });
            }
        }

        const requests = Array.from(byOffer.values())
            .sort(
                (a, b) =>
                    new Date(b._sortDate || 0) -
                    new Date(a._sortDate || 0)
            )
            .map(({ _sortDate, ...item }) => item);

        return res.status(200).json({
            status: 1,
            message: "Company offer status fetched successfully.",
            data: requests
        });
    } catch (error) {
        console.error("Get Company Offer Change Requests Error:", error);

        return res.status(500).json({
            status: 0,
            message: "Failed to fetch company offer status."
        });
    }
};

export const respondToOfferChangeRequest = async (req, res) => {
    try {
        const companyId = req.user?.id;
        const { requestId } = req.params;
        const {
            status,
            companyResponse,
            revisedSalary,
            revisedJoiningDate,
            revisedWorkLocation
        } = req.body;

        if (
            req.user?.role !== "recruiter" ||
            !mongoose.isValidObjectId(companyId)
        ) {
            return res.status(403).json({
                status: 0,
                message: "Company access required."
            });
        }

        const company = await Company.findOne({
            _id: companyId,
            verificationStatus: "approved"
        });

        if (!company) {
            return res.status(403).json({
                status: 0,
                message: "Only approved companies can respond."
            });
        }

        if (!mongoose.isValidObjectId(requestId)) {
            return res.status(400).json({
                status: 0,
                message: "Invalid request ID."
            });
        }

        const validStatuses = [
            "Offer Revised",
            "Original Offer Maintained",
            "Request Declined"
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                status: 0,
                message: "Invalid response status."
            });
        }

        const changeRequest = await OfferChangeRequest.findOne({
            _id: requestId,
            companyId: company._id,
            status: "Pending"
        });

        if (!changeRequest) {
            return res.status(404).json({
                status: 0,
                message: "Pending change request not found."
            });
        }

        if (!companyResponse?.trim()) {
            return res.status(400).json({
                status: 0,
                message: "Please enter a response for the candidate."
            });
        }

        if (status === "Offer Revised") {
            const offer = await JobOffer.findOne({
                _id: changeRequest.offerId,
                companyId: company._id,
                status: "Offer Sent"
            });

            if (!offer) {
                return res.status(400).json({
                    status: 0,
                    message: "This offer is no longer available for revision."
                });
            }

            if (changeRequest.requestType === "Salary") {
                const salary = Number(revisedSalary);

                if (
                    revisedSalary === undefined ||
                    revisedSalary === "" ||
                    !Number.isFinite(salary) ||
                    salary <= 0
                ) {
                    return res.status(400).json({
                        status: 0,
                        message: "Enter a valid revised salary."
                    });
                }

                offer.salary = salary;
            }

            if (changeRequest.requestType === "Joining Date") {
                const date = new Date(revisedJoiningDate);

                if (
                    !revisedJoiningDate ||
                    Number.isNaN(date.getTime()) ||
                    date <= new Date()
                ) {
                    return res.status(400).json({
                        status: 0,
                        message: "Enter a valid future joining date."
                    });
                }

                offer.joiningDate = date;
            }

            if (changeRequest.requestType === "Work Location") {
                if (!revisedWorkLocation?.trim()) {
                    return res.status(400).json({
                        status: 0,
                        message: "Enter the revised work location."
                    });
                }

                offer.workLocation = revisedWorkLocation.trim();
            }

            offer.offerDetails =
                `${offer.offerDetails}\n\nCompany Response: ${companyResponse.trim()}`;

            await offer.save();
        }

        changeRequest.status = status;
        changeRequest.companyResponse = companyResponse.trim();
        changeRequest.respondedAt = new Date();

        await changeRequest.save();

        return res.status(200).json({
            status: 1,
            message: "Your response has been submitted successfully.",
            data: changeRequest
        });
    } catch (error) {
        console.error("Respond to Offer Change Request Error:", error);

        return res.status(500).json({
            status: 0,
            message: "Failed to submit the company response."
        });
    }
};
