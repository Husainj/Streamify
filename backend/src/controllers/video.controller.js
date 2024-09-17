import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import fs from "fs"
//✅
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const skip = (pageNumber - 1) * limitNumber;

    // Build filter criteria
    const filter = {};
    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ];
    }
    if (userId) {
        filter.owner = userId;
    }

    // Build sort criteria
    const sort = {};
    if (sortBy && sortType) {
        sort[sortBy] = sortType === 'asc' ? 1 : -1;
    }

    try {
        // Find videos with filter, sort, and pagination
        const videos = await Video.find(filter)
        .populate({
            path: 'owner',  // Field in the Video model referencing the User model
            select: 'fullname username'  // Fields you want to select from the User model
        })
            .sort(sort)
            .skip(skip)
            .limit(limitNumber);

        // Get total count of videos for pagination
        const totalVideos = await Video.countDocuments(filter);

        // Prepare pagination info
        const pagination = {
            currentPage: pageNumber,
            totalPages: Math.ceil(totalVideos / limitNumber),
            totalVideos
        };

        return res.status(200).json(new ApiResponse(200, { videos, pagination }, "Videos retrieved successfully"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Internal server error"));
    }
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
    .populate({
      path: 'owner',
      select: 'username fullname' // Only select the username and fullname fields
    });

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

const viewIncreamenter = asyncHandler(async (req, res) =>{
    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(400 , "Video Id not found")
    }


    const video = await Video.findByIdAndUpdate(
        videoId,
        { $inc: { views: 1 } }, // Increment view count by 1
        { new: true } // Return the updated video document
      );

      if(!video){
        throw new ApiError(400 , " Views not updated ")
      }

      return res
      .status(200)
      .json(new ApiResponse(200 , { views: video.views } , "Views updated"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    viewIncreamenter
}