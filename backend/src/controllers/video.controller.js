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
    const { page = 1, limit = 100, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query;

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
    const { title, description, videoUrl, thumbnailUrl, duration } = req.body;

    // Check for required fields
    if (!title?.trim() || !description?.trim() || !videoUrl || !thumbnailUrl) {
        throw new ApiError(400, "Title, description, video URL, and thumbnail URL are required");
    }

    // Validate URLs (basic check, you might want to add more robust validation)
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(videoUrl) || !urlRegex.test(thumbnailUrl)) {
        throw new ApiError(400, "Invalid video or thumbnail URL");
    }

    // Create video entry
    const newVideo = await Video.create({
        title,
        description,
        duration: duration || 0, // Use provided duration or default to 0
        owner: req.user._id, // Assuming req.user is populated with user details
        thumbnail: thumbnailUrl,
        videoFile: videoUrl
    });

    res.status(201).json(new ApiResponse(201, newVideo, "Video published successfully"));
});


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
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!videoId) {
        throw new ApiError(400, "Video Id not found");
    }

    // Find the video first
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check if the user is the owner of the video
    // if (video.owner.toString() !== req.user._id.toString()) {
    //     throw new ApiError(403, "You don't have permission to update this video");
    // }

    let updateFields = {};

    if (title) {
        updateFields.title = title;
    }

    if (description) {
        updateFields.description = description;
    }

    // Handle thumbnail update
    if (req.file && req.file.fieldname === 'thumbnail') {
        const thumbnailFile = req.file;
        const thumbnailBuffer = thumbnailFile.buffer;
        const thumbnailFileName = thumbnailFile.originalname;

        if (!thumbnailBuffer) {
            throw new ApiError(400, "Thumbnail file is required, Buffer is missing");
        }

        // Upload thumbnail to Cloudinary
        const thumbnail = await uploadOnCloudinary(thumbnailBuffer, thumbnailFileName);

        if (!thumbnail) {
            throw new ApiError(400, "Thumbnail file upload failed");
        }

        updateFields.thumbnail = thumbnail.url;
    }

    // Update the video
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateFields },
        { new: true }
    );

    if (!updatedVideo) {
        throw new ApiError(500, "Failed to update video");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

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