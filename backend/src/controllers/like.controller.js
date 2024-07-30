import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

 //✅
const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    const existLike = await Like.findOne({video:videoId  ,  likedBy: req.user._id })

    if(existLike){
        await Like.findByIdAndDelete(existLike._id)
        return res.status(200).json(new ApiResponse(200, null, "Like removed successfully"));
    }else{
         const newLike = await Like.create({
            video : videoId,
            likedBy : req.user._id
        })
        return res
    .status(200)
    .json(
        new ApiResponse(200, newLike, "Like added successfully")
    )
    }
   
})

 //✅
const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID");
    }

    const existLike = await Like.findOne({comment:commentId  ,  likedBy: req.user._id })

    if(existLike){
        await Like.findByIdAndDelete(existLike._id)
        return res.status(200).json(new ApiResponse(200, null, "Like removed successfully"));
    }else{
         const newLike = await Like.create({
            comment : commentId,
            likedBy : req.user._id
        })
        return res
    .status(200)
    .json(
        new ApiResponse(200, newLike, "Like added successfully")
    )
    }

})

 //✅
const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID");
    }

    const existLike = await Like.findOne({tweet:tweetId  ,  likedBy: req.user._id })

    if(existLike){
        await Like.findByIdAndDelete(existLike._id)
        return res.status(200).json(new ApiResponse(200, null, "Like removed successfully"));
    }else{
         const newLike = await Like.create({
            tweet : tweetId,
            likedBy : req.user._id
        })
        return res
    .status(200)
    .json(
        new ApiResponse(200, newLike, "Like added successfully")
    )
    }

}
)

 //✅
const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: req.user._id
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $unwind: "$video"
        },
        {
            $project: {
                _id: 0,
                videoId: "$video._id",
                videoFile: "$video.videoFile",
                title: "$video.title",
                description: "$video.description",
                thumbnail: "$video.thumbnail"
            }
        }
    ])
    

    return res
    .status(200)
    .json(new ApiResponse(200 , likedVideos , "All liked videos of the current user is fetched"))
   
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}