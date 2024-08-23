import mongoose , {isValidObjectId}  from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

//✅
const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 100} = req.query

    const comments = await Comment.find({video : videoId})
    .populate('owner', 'username avatar') //This will populate the owner details
    .skip((page-1) * limit)
    .limit(limit)
    .sort({createdAt : -1}) // Sort by creation date by decending order

    if(!comments){
        throw new ApiError(404, "No Comments found")
    }

    // const totalComments = await Comment.countDocuments({ video: videoId });  //this will count the total number of comments

    return res
    .status(200)
    .json(
        new ApiResponse(200, {comments, page, limit}, "Comments fetched successfully")
    )

})

 //✅
const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }
    if(!content){
        throw new ApiError(400 , "Content not entered")
    }

    const comment = await Comment.create({
        content,
        video : videoId,
        owner : req.user._id
    })

    if(!comment){
        throw new ApiError(400 , "Comment not added")
    }

    return res
    .status(200)
    .json(new ApiResponse(200 , comment , "New comment added"))


})

//✅
const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID");
    }
    if(!content){
        throw new ApiError(400 , "No content added")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content
            }
        },{new : true}
    )

    if(!updatedComment){
        throw new ApiError(400 , "Comment not updated or not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200 , updatedComment , "Comment updated succesfully"))

})

//✅
const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID");
    }

    const comment = await Comment.findByIdAndDelete(commentId)

    if(!comment){
        throw new ApiError(400 , "Comment not deleted")
    }

    return res
    .status(200)
    .json(new ApiResponse(200 , comment , "Comment deleted"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }