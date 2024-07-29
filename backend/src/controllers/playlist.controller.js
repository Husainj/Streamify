import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


 //✅//TODO: create playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if (
        [name, description].some((field) => field?.trim() === "")
      ) {
        throw new ApiError(400, "All fields are required");
      }

    const playlist = await Playlist.create({
        name,
        description,
        owner : req.user._id
        })

        if(!playlist){
            throw new ApiError(400 , "Playlist not created")
        }

return res
.status(200)
.json(new ApiResponse(200 , playlist , "New playlist created"))
    

   
})

//✅
const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlist
    
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID");
    }

    const playlists = await Playlist.find({owner:userId})

    if(!playlists){
        throw new ApiError(400 , "No playlist Found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200 , playlists , "Playlist of user fetched"))


})

//✅
const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid User ID");
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404 , "Playlist Not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200 , playlist , "Playlist fetched succesfully"))

})

//✅
const addVideoToPlaylist = asyncHandler(async (req, res) => {

    const {playlistId, videoId} = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID");
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            videos : videoId
        },
        {
            new : true
        }
    )

    if(!playlist){
        throw new ApiError(404, "Unable to update playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Video added successfully")
    )

})

//✅
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID");
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: videoId } }, // Use $pull to remove videoId from videos array
        { new: true }
    );

    if (!playlist) {
        throw new ApiError(404, "Unable to update playlist");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "Video removed successfully")
        );

})

//✅
const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID");
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId)

    return res
    .status(200)
    .json(new ApiResponse(200 , playlist , "Playlist deleted"))
  
})

//✅
const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID");
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name,
                description
            }
        },{new: true}
    )

    return res
    .status(200)
    .json(new ApiResponse(200 , playlist , "Playlist updated successfully"))
   
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}