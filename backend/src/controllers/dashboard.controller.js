import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user._id
    if(!userId){
        throw new ApiError(400 , "Invalid channel id")
    }
    const [totalVideos, totalSubscribers, totalViews, totalLikes] = await Promise.all([
  
        Video.countDocuments({ owner: userId }),

        Subscription.countDocuments({ channel: userId }),

        Video.aggregate([
            { $match: { owner: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: null, totalViews: { $sum: "$views" } } }
        ]).then(result => result[0]?.totalViews || 0), // This is because -> Example :  [{ "_id": null, "totalViews": 300 }]

        Like.countDocuments({ 
            video: { $in: await Video.find(
                { owner: userId }).select('_id') 
            } 
        })
        
    ]);

    return res.status(200).json(new ApiResponse(200, {
        totalVideos,
        totalSubscribers,
        totalViews,
        totalLikes
    }, "Channel stats fetched successfully"));

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {channelId} = req.params

    if(!channelId){
        throw new ApiError(400, "Invalid user id")
    }

    const videos = await Video.find({owner : channelId})

    if(!videos){
        throw new ApiError(404, "Video not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, videos, "Videos fetched successfully"
        )
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }