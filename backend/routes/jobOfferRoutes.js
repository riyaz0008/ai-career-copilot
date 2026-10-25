
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
    sendJobOffer,
    getCompanyJobOffers,
    getMyJobOffers,
    respondToJobOffer
} from "../controllers/jobOfferController.js";

const router = express.Router();

router.post(
    "/api/company/job-offers/:applicationId",
    authMiddleware,
    sendJobOffer
);

router.get(
    "/api/company/job-offers",
    authMiddleware,
    getCompanyJobOffers
);

router.get(
    "/api/my-job-offers",
    authMiddleware,
    getMyJobOffers
);

router.put(
    "/api/my-job-offers/:offerId/respond",
    authMiddleware,
    respondToJobOffer
);

export default router;
