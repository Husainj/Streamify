import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import fs from "fs"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})


//no of views left 
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if (
        [title , description].some((field) => field?.trim() === "")
      ) {
        throw new ApiError(400, "All fields are required");
      }
    
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if(!thumbnailLocalPath){
        throw new ApiError(404 , "thumbnail is required")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!thumbnail){
        throw new ApiError(400 , "Thumbnail file is required")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path

    if(!videoLocalPath){
        throw new ApiError(404 , "Video is required")
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath)

    if(!videoFile){
        throw new ApiError(400 , "Video file is required")
    }

    // console.log("Video file :" , videoFile)
const user = req.user

    const duration = await videoFile.duration
// console.log("duration :" , duration)
    const video = await Video.create({
        title ,
        description,
        duration,
        owner : user,
        thumbnail:thumbnail.url,
        videoFile : videoFile.url
    })


    return res
    .status(200)
    .json(new ApiResponse(202 , video , "New video uploaded"))
})

//✅
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId){
        throw new ApiError(400 , "Video Id not found")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404 ,"Video not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200 , video , "Video fetched successfully"))

})

//✅
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title , description} = req.body
    const thumbnailLocalPath = req.file?.path
    //TODO: update video details like title, description, thumbnail
    if(!videoId){
        throw new ApiError(400 , "Video Id not found")
    }

    if(!(title || description || thumbnailLocalPath) ){
       throw new ApiError(400 , "Title, description ,thumbnail not found")
    }

    let updateFields = {};
    if (title) {
        updateFields.title = title;
    }

    if (description) {
        updateFields.description = description;
    }

    if (thumbnailLocalPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if (!thumbnail.url) {
            throw new ApiError(400, "Error while uploading thumbnail");
        }
        updateFields.thumbnail = thumbnail.url;
   
        
    }
 
   

    const video = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateFields },
        { new: true }
    );



  
    return res
    .status(200)
    .json(new ApiResponse(200 , video , "Video updated successfully"))


})

//✅
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!videoId){
        throw new ApiError(400 , "videoId not found")
    }

    const video = await Video.findByIdAndDelete(videoId)

    if(!video){
        throw new ApiError(400 , "Couldn't find or delete the video" )
    }

   return res
   .status(200)
   .json(new ApiResponse(200 , video , "Video deleted sucessfully"))

})

//✅
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(400 , "Video Id not found")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400 , "Video not found")
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res
    .status(200)
    .json(new ApiResponse(200 , video , "Video status toggled successfully"))

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}