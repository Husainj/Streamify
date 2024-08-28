import { Router } from 'express';
import {
    getChannelStats,
    getChannelVideos,
    getCurrentUserChannelProfile,
} from "../controllers/dashboard.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

 // Apply verifyJWT middleware to all routes in this file

router.route("/stats").get(verifyJWT ,getChannelStats);
router.route("/videos/:channelId").get(getChannelVideos);
router.route("/channelDetails").get( verifyJWT,getCurrentUserChannelProfile)
export default router