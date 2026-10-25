
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
    createOfferChangeRequest,
    getMyOfferChangeRequests,
    getCompanyOfferChangeRequests,
    respondToOfferChangeRequest
} from "../controllers/offerChangeRequestController.js";

const router = express.Router();

router.post(
    "/api/my-job-offers/:offerId/change-requests",
    authMiddleware,
    createOfferChangeRequest
);

router.get(
    "/api/my-offer-change-requests",
    authMiddleware,
    getMyOfferChangeRequests
);

router.get(
    "/api/company/offer-change-requests",
    authMiddleware,
    getCompanyOfferChangeRequests
);

router.put(
    "/api/company/offer-change-requests/:requestId/respond",
    authMiddleware,
    respondToOfferChangeRequest
);
export default router;
