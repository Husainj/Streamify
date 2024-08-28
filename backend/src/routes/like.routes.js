import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    getVideoLikes,
    getVideoLikesUnauth,
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
 // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(verifyJWT ,toggleVideoLike);
router.route("/toggle/c/:commentId").post( verifyJWT,toggleCommentLike);
router.route("/toggle/t/:tweetId").post(verifyJWT,toggleTweetLike);
router.route("/videos").get(getLikedVideos);
router.route("/getLikes/:videoId").get(verifyJWT,getVideoLikes)
router.route("/getLikes/u/:videoId").get(getVideoLikesUnauth)
export default router